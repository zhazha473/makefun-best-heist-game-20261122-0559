// The global alarm meter: 0 to 100, shared by every gallery. It climbs while
// any watcher sees the magpie, drains slowly while hidden, and at 100 trips a
// short lockdown that is fair instead of fatal: wardens rush the magpie, then
// the meter falls back to 60 and the heist goes on.

export function createAlarm() {
  return { value: 0, peak: 0, lockdown: 0, lockdownFlash: 0, tripped: 0 };
}

/** Raise the alarm by `amount`, clamping at 100 and tripping lockdown there. */
export function raiseAlarm(alarm, amount) {
  if (alarm.lockdown > 0) return;
  alarm.value = Math.min(100, alarm.value + amount);
  if (alarm.value > alarm.peak) alarm.peak = alarm.value;
  if (alarm.value >= 100) {
    alarm.lockdown = 6;
    alarm.lockdownFlash = 6;
    alarm.tripped += 1;
  }
}

/** Drain the alarm while nobody sees the magpie; count the lockdown down. */
export function updateAlarm(alarm, delta, anyoneSees) {
  if (alarm.lockdown > 0) {
    alarm.lockdown = Math.max(0, alarm.lockdown - delta);
    alarm.lockdownFlash = Math.max(0, alarm.lockdownFlash - delta);
    if (alarm.lockdown === 0) {
      alarm.value = 60;
    }
    return;
  }
  if (!anyoneSees && alarm.value > 0) {
    alarm.value = Math.max(0, alarm.value - 3 * delta);
  }
}

/** One-word label for the HUD: how hot the museum is right now. */
export function alarmLabel(alarm) {
  if (alarm.lockdown > 0) return 'LOCKDOWN';
  if (alarm.value >= 75) return 'RED ALERT';
  if (alarm.value >= 45) return 'ALERTED';
  if (alarm.value >= 20) return 'WARY';
  return 'CALM';
}
