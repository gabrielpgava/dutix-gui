package snapshots

import (
	"os"
	"testing"

	"dutix-gui/pkg/dutix"
)

func TestSnapshotCreateAndList(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "dutix-snap-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	mgr := &Manager{storageDir: tempDir}

	targets := []dutix.TargetItem{
		{
			Extension: "pdf",
			UTI:       "com.adobe.pdf",
			DefaultApp: &dutix.AppInfo{
				Name: "Preview",
				Path: "/System/Applications/Preview.app",
			},
		},
	}

	snap, err := mgr.CreateSnapshot("Teste de Snapshot", targets, "test")
	if err != nil {
		t.Fatalf("failed to create snapshot: %v", err)
	}

	if snap.ID == "" || snap.TargetCount != 1 {
		t.Errorf("unexpected snapshot created: %+v", snap)
	}

	list, err := mgr.ListSnapshots()
	if err != nil {
		t.Fatalf("failed to list snapshots: %v", err)
	}

	if len(list) != 1 {
		t.Fatalf("expected 1 snapshot in list, got %d", len(list))
	}

	loaded, err := mgr.GetSnapshot(snap.ID)
	if err != nil {
		t.Fatalf("failed to get snapshot: %v", err)
	}

	if loaded.Description != "Teste de Snapshot" {
		t.Errorf("unexpected snapshot description: %s", loaded.Description)
	}

	err = mgr.DeleteSnapshot(snap.ID)
	if err != nil {
		t.Fatalf("failed to delete snapshot: %v", err)
	}

	listAfter, _ := mgr.ListSnapshots()
	if len(listAfter) != 0 {
		t.Errorf("expected 0 snapshots after delete, got %d", len(listAfter))
	}
}
