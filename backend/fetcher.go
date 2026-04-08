package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

type FetchResult struct {
	Name string
	Data interface{}
	Err  error
}

func fetchAPIs(apis []APIConfig) (map[string]interface{}, []string) {
	client := &http.Client{Timeout: 10 * time.Second}
	
	results := make(chan FetchResult, len(apis))
	var wg sync.WaitGroup

	for _, api := range apis {
		wg.Add(1)
		go func(a APIConfig) {
			defer wg.Done()
			data, err := fetchAPI(client, a.URL)
			results <- FetchResult{Name: a.Name, Data: data, Err: err}
		}(api)
	}

	go func() {
		wg.Wait()
		close(results)
	}()

	aggregated := make(map[string]interface{})
	var errors []string

	for result := range results {
		if result.Err != nil {
			errors = append(errors, fmt.Sprintf("%s: %v", result.Name, result.Err))
		} else {
			aggregated[result.Name] = result.Data
		}
	}

	return aggregated, errors
}

func fetchAPI(client *http.Client, url string) (interface{}, error) {
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var data interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	return data, nil
}
