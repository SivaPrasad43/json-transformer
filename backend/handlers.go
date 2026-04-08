package main

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

type TransformResponse struct {
	Data   interface{} `json:"data"`
	Logs   []string    `json:"logs"`
	Errors []string    `json:"errors"`
}

func createConfigHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var config TransformConfig
		if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
			respondError(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if config.Name == "" {
			respondError(w, "Name is required", http.StatusBadRequest)
			return
		}

		created := store.Create(&config)
		respondJSON(w, created, http.StatusCreated)
	}
}

func listConfigsHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		configs := store.List()
		respondJSON(w, configs, http.StatusOK)
	}
}

func getConfigHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		config, exists := store.Get(id)
		if !exists {
			respondError(w, "Config not found", http.StatusNotFound)
			return
		}
		respondJSON(w, config, http.StatusOK)
	}
}

func updateConfigHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		
		var config TransformConfig
		if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
			respondError(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if config.Name == "" {
			respondError(w, "Name is required", http.StatusBadRequest)
			return
		}

		updated, exists := store.Update(id, &config)
		if !exists {
			respondError(w, "Config not found", http.StatusNotFound)
			return
		}

		respondJSON(w, updated, http.StatusOK)
	}
}

func deleteConfigHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		
		if !store.Delete(id) {
			respondError(w, "Config not found", http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func respondJSON(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, message string, status int) {
	respondJSON(w, ErrorResponse{Error: message}, status)
}

func transformHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		
		config, exists := store.Get(id)
		if !exists {
			respondError(w, "Config not found", http.StatusNotFound)
			return
		}
		
		inputData, _ := fetchAPIs(config.APIs)
		outputData, _ := transform(inputData, config.OutputSchema, config.Mappings)
		
		respondJSON(w, outputData, http.StatusOK)
	}
}
