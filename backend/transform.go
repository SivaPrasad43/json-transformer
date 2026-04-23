package main

import (
	"fmt"
	"log"
	"regexp"
	"strconv"
)

func transform(input map[string]interface{}, schema map[string]interface{}, mappings map[string]string) (map[string]interface{}, []string) {
	log.Printf("[INFO] Transform: Starting transformation with %d mappings", len(mappings))
	var errors []string
	result := transformValue(input, schema, mappings, "", &errors)
	if resultMap, ok := result.(map[string]interface{}); ok {
		log.Printf("[INFO] Transform: Completed with %d errors", len(errors))
		return resultMap, errors
	}
	log.Printf("[INFO] Transform: Completed with %d errors", len(errors))
	return map[string]interface{}{"result": result}, errors
}

func transformValue(input map[string]interface{}, schema interface{}, mappings map[string]string, parentPath string, errors *[]string) interface{} {
	switch s := schema.(type) {
	case map[string]interface{}:
		output := make(map[string]interface{})
		for key, value := range s {
			currentPath := key
			if parentPath != "" {
				currentPath = parentPath + "." + key
			}

			// Check if array with mapped items
			if arr, isArr := value.([]interface{}); isArr && len(arr) > 0 {
				arrayItemPath := currentPath + "[0]"
				if mapping, exists := mappings[arrayItemPath]; exists {
					val, err := getValueByPath(input, mapping)
					if err == nil {
						output[key] = val
						continue
					}
					*errors = append(*errors, fmt.Sprintf("%s: %v", arrayItemPath, err))
				}
			}

			// Check direct mapping
			if mapping, exists := mappings[currentPath]; exists {
				val, err := getValueByPath(input, mapping)
				if err == nil {
					output[key] = val
				} else {
					*errors = append(*errors, fmt.Sprintf("%s: %v", currentPath, err))
					output[key] = nil
				}
			} else {
				output[key] = transformValue(input, value, mappings, currentPath, errors)
			}
		}
		return output

	case []interface{}:
		output := make([]interface{}, len(s))
		for i, item := range s {
			arrayPath := fmt.Sprintf("%s[%d]", parentPath, i)
			if mapping, exists := mappings[arrayPath]; exists {
				val, err := getValueByPath(input, mapping)
				if err == nil {
					output[i] = val
				} else {
					*errors = append(*errors, fmt.Sprintf("%s: %v", arrayPath, err))
					output[i] = nil
				}
			} else {
				output[i] = transformValue(input, item, mappings, arrayPath, errors)
			}
		}
		return output

	default:
		return s
	}
}

func getValueByPath(data map[string]interface{}, path string) (interface{}, error) {
	if path == "" {
		return nil, fmt.Errorf("empty path")
	}

	parts := parsePath(path)
	var current interface{} = data

	for i, part := range parts {
		if part.isArray {
			arr, ok := current.([]interface{})
			if !ok {
				return nil, fmt.Errorf("not an array at %s", part.key)
			}
			
			// Check if there are more parts after this array access
			if i < len(parts)-1 {
				// This is array mapping like products[0].title - extract from all items
				result := make([]interface{}, 0, len(arr))
				for _, item := range arr {
					// Apply remaining path parts to each array item
					val, err := applyPathParts(item, parts[i+1:])
					if err == nil {
						result = append(result, val)
					}
				}
				return result, nil
			}
			
			// Just array access, no wildcard
			if part.index >= len(arr) {
				return nil, fmt.Errorf("index out of bounds: %d", part.index)
			}
			current = arr[part.index]
		} else {
			obj, ok := current.(map[string]interface{})
			if !ok {
				return nil, fmt.Errorf("not an object at %s", part.key)
			}
			val, exists := obj[part.key]
			if !exists {
				return nil, fmt.Errorf("key not found: %s", part.key)
			}
			current = val
		}
	}

	return current, nil
}

func applyPathParts(data interface{}, parts []pathPart) (interface{}, error) {
	current := data
	for _, part := range parts {
		if part.isArray {
			arr, ok := current.([]interface{})
			if !ok {
				return nil, fmt.Errorf("not an array")
			}
			if part.index >= len(arr) {
				return nil, fmt.Errorf("index out of bounds")
			}
			current = arr[part.index]
		} else {
			obj, ok := current.(map[string]interface{})
			if !ok {
				return nil, fmt.Errorf("not an object")
			}
			val, exists := obj[part.key]
			if !exists {
				return nil, fmt.Errorf("key not found: %s", part.key)
			}
			current = val
		}
	}
	return current, nil
}

func setValueByPath(data map[string]interface{}, path string, value interface{}) {
	parts := parsePath(path)
	if len(parts) == 0 {
		return
	}

	var current interface{} = data
	for i := 0; i < len(parts)-1; i++ {
		part := parts[i]
		obj := current.(map[string]interface{})
		
		if _, exists := obj[part.key]; !exists {
			if i+1 < len(parts) && parts[i+1].isArray {
				obj[part.key] = []interface{}{}
			} else {
				obj[part.key] = make(map[string]interface{})
			}
		}
		current = obj[part.key]
	}

	lastPart := parts[len(parts)-1]
	obj := current.(map[string]interface{})
	obj[lastPart.key] = value
}

type pathPart struct {
	key     string
	isArray bool
	index   int
}

func parsePath(path string) []pathPart {
	var parts []pathPart
	re := regexp.MustCompile(`([^\[\]\.]+)(\[(\d+)\])?`)
	matches := re.FindAllStringSubmatch(path, -1)

	for _, match := range matches {
		key := match[1]
		if match[2] != "" {
			index, _ := strconv.Atoi(match[3])
			parts = append(parts, pathPart{key: key, isArray: false, index: 0})
			parts = append(parts, pathPart{key: "", isArray: true, index: index})
		} else {
			parts = append(parts, pathPart{key: key, isArray: false, index: 0})
		}
	}

	return parts
}
