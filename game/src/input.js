// Keyboard and mouse input: WASD or arrows to move, Shift to sneak, Space
// to run, 1-5 for tools, H for a hint, R to restart the gallery, M to mute,
// P or Escape to pause. A mouse click sets a walk-to point; the magpie slides
// along walls toward it. Just-pressed keys are consumed once per frame.

export function createInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    sneak: false,
    run: false,
    pressed: new Set(),
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0, clicked: false, clickWorldX: 0, clickWorldY: 0 },
  };
}

const KEY_ACTIONS = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ShiftLeft: 'sneak',
  ShiftRight: 'sneak',
  Space: 'run',
};

export function attachInput(input, canvas, toWorld, callbacks) {
  window.addEventListener('keydown', (event) => {
    if (event.repeat) {
      if (event.code === 'Space') event.preventDefault();
      return;
    }
    const action = KEY_ACTIONS[event.code];
    if (action) {
      input[action] = true;
      if (event.code === 'Space') event.preventDefault();
    }
    input.pressed.add(event.code);
    if (callbacks.onKey) callbacks.onKey(event.code);
  });
  window.addEventListener('keyup', (event) => {
    const action = KEY_ACTIONS[event.code];
    if (action) input[action] = false;
  });
  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = input.sneak = input.run = false;
  });
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouse.x = event.clientX - rect.left;
    input.mouse.y = event.clientY - rect.top;
    const world = toWorld(input.mouse.x, input.mouse.y);
    input.mouse.worldX = world.x;
    input.mouse.worldY = world.y;
  });
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const world = toWorld(event.clientX - rect.left, event.clientY - rect.top);
    input.mouse.clicked = true;
    input.mouse.clickWorldX = world.x;
    input.mouse.clickWorldY = world.y;
    if (callbacks.onClick) callbacks.onClick(world.x, world.y);
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
}

/** Clear the once-per-frame presses after the game has read them. */
export function endFrameInput(input) {
  input.pressed.clear();
  input.mouse.clicked = false;
}
