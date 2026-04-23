package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
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
	log.Printf("[INFO] Starting concurrent fetch for %d APIs", len(apis))
	client := &http.Client{Timeout: 10 * time.Second}
	
	results := make(chan FetchResult, len(apis))
	var wg sync.WaitGroup

	for _, api := range apis {
		wg.Add(1)
		go func(a APIConfig) {
			defer wg.Done()
			log.Printf("[INFO] Fetching API: name=%s, url=%s", a.Name, a.URL)
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
			log.Printf("[ERROR] API fetch failed: name=%s, error=%v", result.Name, result.Err)
			errors = append(errors, fmt.Sprintf("%s: %v", result.Name, result.Err))
		} else {
			log.Printf("[INFO] API fetch successful: name=%s", result.Name)
			aggregated[result.Name] = result.Data
		}
	}

	log.Printf("[INFO] Fetch completed: %d successful, %d failed", len(aggregated), len(errors))
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
