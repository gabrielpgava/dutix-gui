package logs

import (
	"sync"
	"time"
)

// ExecutionLog represents a recorded CLI execution
type ExecutionLog struct {
	ID         string    `json:"id"`
	Timestamp  time.Time `json:"timestamp"`
	Command    string    `json:"command"`
	Args       []string  `json:"args"`
	Stdout     string    `json:"stdout"`
	Stderr     string    `json:"stderr"`
	ExitCode   int       `json:"exit_code"`
	DurationMs int64     `json:"duration_ms"`
	Success    bool      `json:"success"`
}

type Logger struct {
	mu      sync.RWMutex
	logs    []ExecutionLog
	maxLogs int
}

func NewLogger(maxLogs int) *Logger {
	if maxLogs <= 0 {
		maxLogs = 200
	}
	return &Logger{
		logs:    make([]ExecutionLog, 0, maxLogs),
		maxLogs: maxLogs,
	}
}

func (l *Logger) AddLog(log ExecutionLog) {
	l.mu.Lock()
	defer l.mu.Unlock()

	if log.Timestamp.IsZero() {
		log.Timestamp = time.Now()
	}

	if len(l.logs) >= l.maxLogs {
		l.logs = l.logs[1:]
	}
	l.logs = append(l.logs, log)
}

func (l *Logger) GetLogs() []ExecutionLog {
	l.mu.RLock()
	defer l.mu.RUnlock()

	result := make([]ExecutionLog, len(l.logs))
	copy(result, l.logs)
	return result
}

func (l *Logger) Clear() {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.logs = make([]ExecutionLog, 0, l.maxLogs)
}
