package main

import (
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
)

type APIConfig struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
}

type TransformConfig struct {
	ID           string                 `json:"id"`
	Name         string                 `json:"name"`
	APIs         []APIConfig            `json:"apis"`
	OutputSchema map[string]interface{} `json:"outputSchema"`
	Mappings     map[string]string      `json:"mappings"`
	CreatedAt    time.Time              `json:"createdAt"`
	UpdatedAt    time.Time              `json:"updatedAt"`
}

type ConfigStore struct {
	mu      sync.RWMutex
	configs map[string]*TransformConfig
}

func NewConfigStore() *ConfigStore {
	return &ConfigStore{
		configs: make(map[string]*TransformConfig),
	}
}

func (s *ConfigStore) Create(config *TransformConfig) *TransformConfig {
	s.mu.Lock()
	defer s.mu.Unlock()

	config.ID = uuid.New().String()
	config.CreatedAt = time.Now()
	config.UpdatedAt = time.Now()
	s.configs[config.ID] = config
	log.Printf("[INFO] Store: Config created - id=%s, name=%s, apis=%d", config.ID, config.Name, len(config.APIs))
	return config
}

func (s *ConfigStore) Get(id string) (*TransformConfig, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	config, exists := s.configs[id]
	return config, exists
}

func (s *ConfigStore) List() []*TransformConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()

	configs := make([]*TransformConfig, 0, len(s.configs))
	for _, config := range s.configs {
		configs = append(configs, config)
	}
	return configs
}

func (s *ConfigStore) Update(id string, updated *TransformConfig) (*TransformConfig, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	config, exists := s.configs[id]
	if !exists {
		log.Printf("[WARN] Store: Config not found for update - id=%s", id)
		return nil, false
	}

	updated.ID = config.ID
	updated.CreatedAt = config.CreatedAt
	updated.UpdatedAt = time.Now()
	s.configs[id] = updated
	log.Printf("[INFO] Store: Config updated - id=%s, name=%s", updated.ID, updated.Name)
	return updated, true
}

func (s *ConfigStore) Delete(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	_, exists := s.configs[id]
	if !exists {
		log.Printf("[WARN] Store: Config not found for deletion - id=%s", id)
		return false
	}

	delete(s.configs, id)
	log.Printf("[INFO] Store: Config deleted - id=%s", id)
	return true
}
