package repository

import (
	"strings"
	"testing"
)

func TestLuaScriptIntegrity(t *testing.T) {
	// Verify that the Lua script defines all essential constraints
	if !strings.Contains(atomicBidValidationLua, "status ~= 'ACTIVE'") {
		t.Errorf("Lua script missing ACTIVE status validation check")
	}

	if !strings.Contains(atomicBidValidationLua, "proposed_bid < min_required") {
		t.Errorf("Lua script missing minimum bid increment validation check")
	}

	if !strings.Contains(atomicBidValidationLua, "current_highest_bid") {
		t.Errorf("Lua script missing current_highest_bid update")
	}

	if !strings.Contains(atomicBidValidationLua, "highest_bidder_id") {
		t.Errorf("Lua script missing highest_bidder_id update")
	}

	if !strings.Contains(atomicBidValidationLua, "return { 'SUCCESS'") {
		t.Errorf("Lua script missing SUCCESS return tuple")
	}
}
