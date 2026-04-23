package main

import (
	"encoding/json"
	"log"
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
		log.Printf("[INFO] Creating new config")
		var config TransformConfig
		if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
			log.Printf("[ERROR] Failed to decode request body: %v", err)
			respondError(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if config.Name == "" {
			log.Printf("[WARN] Config creation failed: name is required")
			respondError(w, "Name is required", http.StatusBadRequest)
			return
		}

		created := store.Create(&config)
		log.Printf("[INFO] Config created successfully: id=%s, name=%s", created.ID, created.Name)
		respondJSON(w, created, http.StatusCreated)
	}
}

func listConfigsHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("[INFO] Listing all configs")
		configs := store.List()
		log.Printf("[INFO] Found %d configs", len(configs))
		respondJSON(w, configs, http.StatusOK)
	}
}

func getConfigHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		log.Printf("[INFO] Getting config: id=%s", id)
		config, exists := store.Get(id)
		if !exists {
			log.Printf("[WARN] Config not found: id=%s", id)
			respondError(w, "Config not found", http.StatusNotFound)
			return
		}
		log.Printf("[INFO] Config retrieved: id=%s, name=%s", config.ID, config.Name)
		respondJSON(w, config, http.StatusOK)
	}
}

func updateConfigHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		log.Printf("[INFO] Updating config: id=%s", id)
		
		var config TransformConfig
		if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
			log.Printf("[ERROR] Failed to decode request body: %v", err)
			respondError(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if config.Name == "" {
			log.Printf("[WARN] Config update failed: name is required")
			respondError(w, "Name is required", http.StatusBadRequest)
			return
		}

		updated, exists := store.Update(id, &config)
		if !exists {
			log.Printf("[WARN] Config not found for update: id=%s", id)
			respondError(w, "Config not found", http.StatusNotFound)
			return
		}

		log.Printf("[INFO] Config updated successfully: id=%s, name=%s", updated.ID, updated.Name)
		respondJSON(w, updated, http.StatusOK)
	}
}

func deleteConfigHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		log.Printf("[INFO] Deleting config: id=%s", id)
		
		if !store.Delete(id) {
			log.Printf("[WARN] Config not found for deletion: id=%s", id)
			respondError(w, "Config not found", http.StatusNotFound)
			return
		}

		log.Printf("[INFO] Config deleted successfully: id=%s", id)
		w.WriteHeader(http.StatusNoContent)
	}
}

func respondJSON(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, message string, status int) {
	log.Printf("[ERROR] HTTP %d: %s", status, message)
	respondJSON(w, ErrorResponse{Error: message}, status)
}

func transformHandler(store *ConfigStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := mux.Vars(r)["id"]
		log.Printf("[INFO] Executing transformation: id=%s", id)
		
		config, exists := store.Get(id)
		if !exists {
			log.Printf("[WARN] Config not found for transformation: id=%s", id)
			respondError(w, "Config not found", http.StatusNotFound)
			return
		}
		
		log.Printf("[INFO] Fetching %d APIs for transformation", len(config.APIs))
		inputData, fetchErrors := fetchAPIs(config.APIs)
		if len(fetchErrors) > 0 {
			log.Printf("[WARN] API fetch errors: %v", fetchErrors)
		}
		
		log.Printf("[INFO] Applying transformation mappings")
		outputData, transformErrors := transform(inputData, config.OutputSchema, config.Mappings)
		if len(transformErrors) > 0 {
			log.Printf("[WARN] Transformation errors: %v", transformErrors)
		}
		
		log.Printf("[INFO] Transformation completed: id=%s", id)
		respondJSON(w, outputData, http.StatusOK)
	}
}
