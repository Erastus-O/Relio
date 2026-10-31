/* Data layer: the one place the screens read and write their data.
 *
 * Every screen works from one state object (S). DataStore decides where that
 * state comes from and where changes go. In demo mode it's the sample data from
 * the design, saved in this browser. To connect the API, implement load, save
 * and action for mode "api"; the screens don't need to change.
 */
const APP_SURFACE = window.RELIO_CONFIG.surface;
const DataStore = {
  demo: window.RELIO_CONFIG.mode !== "api",
  key: "relio-customer-v1",
  /** Returns the saved state, or null to start from the sample data. */
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  /** Called after every change. */
  save(state) {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch (e) {
      /* storage full or unavailable: the app keeps working for this visit */
    }
  },
  /** Called after every button or form action with its name and data, for example
      ("adDecide", { id: "D-301" }). In API mode, send the change to the matching endpoint here. */
  action(name, data, state) {},
};
