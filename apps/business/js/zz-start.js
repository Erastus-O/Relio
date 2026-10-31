/* Start-up: every action also goes through DataStore.action so it can reach the API. */
for (const name of Object.keys(ACT)) {
  const fn = ACT[name];
  ACT[name] = (data, ev) => {
    const r = fn(data, ev);
    if (r !== false) DataStore.action(name, data, S);
    return r;
  };
}
