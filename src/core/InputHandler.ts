
interface KeyState {
    isDown: boolean,
    justPressed: boolean;
}

export class InputHandler
{
    get Keys(): Map<string, KeyState>
    {
        return this.keys;
    }

    get MouseButtons(): Map<string, KeyState>
    {
        return this.mouseButtons;
    }

    private keys: Map<string, KeyState> = new Map();
    private keyMap: Map<number, string> = new Map();
    private mouseButtons: Map<string, KeyState> = new Map();
    private mouseButtonMap: Map<number, string> = new Map();

    constructor()
    {
        window.addEventListener('keydown', (event: KeyboardEvent) =>
        {
            this.setKeyFromKeyCode(event.keyCode, true);
        });

        window.addEventListener('keyup', (event) =>
        {
            this.setKeyFromKeyCode(event.keyCode, false);
        });

        window.addEventListener('mousedown', (event: MouseEvent) =>
        {
            this.setMouseFromButtonIndex(event.button, true);
        });

        window.addEventListener('mouseup', (event: MouseEvent) =>
        {
            this.setMouseFromButtonIndex(event.button, false);
        });


        this.addKey(37, 'left');
        this.addKey(39, 'right');
        this.addKey(38, 'up');
        this.addKey(40, 'down');
        this.addKey(87, 'w');
        this.addKey(65, 'a');
        this.addKey(83, 's');
        this.addKey(68, 'd');
        this.addKey(32, 'space');

        this.addMouseButton(0, 'leftMouse');
        this.addMouseButton(1, 'middleMouse');
        this.addMouseButton(2, 'rightMouse');
    }

    update(): void
    {
        this.keys.forEach((value: KeyState, key: string) =>
        {
            if (value.justPressed) {
                value.justPressed = false;
            }
        });

        this.mouseButtons.forEach((value: KeyState, button: string) =>
        {
            if (value.justPressed) {
                value.justPressed = false;
            }
        });
    }

    private addKey(code: number, keyName: string): void
    {
        const state: KeyState = { isDown: false, justPressed:false };

        this.keys.set(keyName, state);
;
        this.keyMap.set(code, keyName);
    }

    private addMouseButton(buttonIndex: number, buttonName: string): void
    {
        const state: KeyState = { isDown: false, justPressed: false };

        this.mouseButtons.set(buttonName, state);

        this.mouseButtonMap.set(buttonIndex, buttonName);
    }

    private setKeyFromKeyCode(code: number, isPressed: boolean): void
    {
        const keyName = this.keyMap.get(code);

        if (!keyName) {
            return;
        }

        this.setKey(keyName, isPressed);
    }

    private setMouseFromButtonIndex(buttonIdx: number, isPressed: boolean): void
    {
        const buttonName = this.mouseButtonMap.get(buttonIdx);

        if (!buttonName) {
            return;
        }

        this.setMouseButton(buttonName, isPressed);
    }

    private setMouseButton(buttonName: string, isPressed: boolean): void
    {
        var state = this.mouseButtons.get(buttonName);

        if (state == undefined) return;

        state.justPressed = isPressed && !state.isDown;
        state.isDown = isPressed;
    }

    private setKey(keyname: string, isPressed: boolean): void
    {
        var state = this.keys.get(keyname);

        if (state == undefined) return;

        state.justPressed = isPressed && !state.isDown;
        state.isDown = isPressed;
    }
}