export function trackEvent(
  name: string,
  props?: Record<string, string | number>,
) {
  void name;
  void props;
  // Hook Plausible or other analytics provider here.
  // Intentionally left as a thin wrapper so analytics can be swapped or disabled.
}
