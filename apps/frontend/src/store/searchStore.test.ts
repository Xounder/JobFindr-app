import { describe, it, expect, beforeEach } from "vitest";
import { useSearchStore } from "./searchStore";

describe("searchStore — userSkills / userSeniority", () => {
  beforeEach(() => {
    useSearchStore.setState({
      userSkills: [],
      userSeniority: "",
      skills: [],
      page: 1,
    });
  });

  it("initialises userSkills as empty array", () => {
    const state = useSearchStore.getState();
    expect(state.userSkills).toEqual([]);
  });

  it("initialises userSeniority as empty string", () => {
    const state = useSearchStore.getState();
    expect(state.userSeniority).toBe("");
  });

  it("setUserSkills updates userSkills and resets page to 1", () => {
    useSearchStore.setState({ page: 3 });
    useSearchStore.getState().setUserSkills(["TypeScript", "React"]);
    const state = useSearchStore.getState();
    expect(state.userSkills).toEqual(["TypeScript", "React"]);
    expect(state.page).toBe(1);
  });

  it("setUserSeniority updates userSeniority and resets page to 1", () => {
    useSearchStore.setState({ page: 2 });
    useSearchStore.getState().setUserSeniority("senior");
    const state = useSearchStore.getState();
    expect(state.userSeniority).toBe("senior");
    expect(state.page).toBe(1);
  });

  it("resetFilters clears userSkills and userSeniority", () => {
    useSearchStore.getState().setUserSkills(["Go", "Rust"]);
    useSearchStore.getState().setUserSeniority("lead");
    useSearchStore.getState().resetFilters();
    const state = useSearchStore.getState();
    expect(state.userSkills).toEqual([]);
    expect(state.userSeniority).toBe("");
  });

  it("persists userSkills and userSeniority round-trip through localStorage", async () => {
    const store = useSearchStore;

    // 1. Set values — persist middleware writes to localStorage
    store.getState().setUserSkills(["TypeScript", "React"]);
    store.getState().setUserSeniority("senior");

    // 2. Confirm localStorage was written with correct wrapped format
    const raw = localStorage.getItem("jobfindr-filters");
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    expect(stored.state.userSkills).toEqual(["TypeScript", "React"]);
    expect(stored.state.userSeniority).toBe("senior");

    // 3. Save a copy before reset (setState triggers persist and overwrites)
    const savedRaw = raw;

    // 4. Reset in-memory state (also overwrites localStorage via persist)
    store.setState({
      userSkills: [],
      userSeniority: "",
      skills: [],
      page: 1,
    });
    expect(store.getState().userSkills).toEqual([]);
    expect(store.getState().userSeniority).toBe("");

    // 5. Restore the previously saved localStorage content
    localStorage.setItem("jobfindr-filters", savedRaw!);

    // 6. Rehydrate from localStorage
    await store.persist.rehydrate();

    // 7. Assert persisted values are restored
    const restored = store.getState();
    expect(restored.userSkills).toEqual(["TypeScript", "React"]);
    expect(restored.userSeniority).toBe("senior");
  });
});
