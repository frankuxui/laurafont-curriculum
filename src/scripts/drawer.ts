type Orientation = "top" | "bottom" | "left" | "right";

interface DrawerOptions {
  trigger?: string;
  wrapper: string;
  content: string;
  orientation?: Orientation;
  backdropSelector?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

type DrawerEvent = "open" | "close";
type DrawerEventHandler = () => void;

export class Drawer {
  private triggerElements: NodeListOf<HTMLElement> | null = null;
  private wrapperEl: HTMLElement;
  private contentEl: HTMLElement;
  private backdropEl: HTMLElement | null = null;
  private orientation: Orientation;
  private onOpen?: () => void;
  private onClose?: () => void;
  private portal: HTMLElement | null = null;

  private eventListeners: Map<DrawerEvent, DrawerEventHandler[]> = new Map();

  private boundToggle: () => void;
  private boundCloseOnBackdrop: (e: Event) => void;
  // private boundResizeHandler: () => void;

  constructor(private options: DrawerOptions) {
    this.wrapperEl = document.querySelector(this.options.wrapper)!;
    this.contentEl = document.querySelector(this.options.content)!;
    this.portal = document.querySelector("#portal");
    this.orientation = options.orientation || "right";
    this.onOpen = options.onOpen;
    this.onClose = options.onClose;

    this.boundToggle = this.toggle.bind(this);
    this.boundCloseOnBackdrop = this.closeOnBackdrop.bind(this);
    // this.boundResizeHandler = this.handleResize.bind(this);
  }

  init() {
    if (this.options.trigger) {
      this.triggerElements = document.querySelectorAll(this.options.trigger);
      this.triggerElements.forEach((el) => {
        el.addEventListener("click", this.boundToggle);
      });
    }

    this.backdropEl = this.wrapperEl.querySelector(
      this.options.backdropSelector || "[data-toggle='menu-mobile']"
    );
    this.backdropEl?.addEventListener("click", this.boundCloseOnBackdrop);
    // window.addEventListener("resize", this.boundResizeHandler);
  }

  on(event: DrawerEvent, handler: DrawerEventHandler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(handler);
  }

  private emit(event: DrawerEvent) {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler());
    }
  }

  open() {
    if (this.portal) {
      this.portal.appendChild(this.wrapperEl);
    }
    this.wrapperEl.classList.remove("hidden");
    this.wrapperEl.classList.add("block");
    this.contentEl.style.animation = `var(--animate-slide-in-${this.orientation})`;
    this.onOpen?.();
    this.emit("open");
  }

  close(afterCloseCallback?: () => void) {
    this.contentEl.style.animation = `var(--animate-slide-out-${this.orientation})`;
    this.contentEl.addEventListener(
      "animationend",
      () => {
        this.wrapperEl.classList.remove("block");
        this.wrapperEl.classList.add("hidden");
        this.onClose?.();
        this.emit("close");
        afterCloseCallback?.();
      },
      { once: true }
    );
  }

  toggle() {
    if (this.wrapperEl.classList.contains("hidden")) {
      this.open();
    } else {
      this.close();
    }
  }

  private closeOnBackdrop(e: Event) {
    if (e.target === this.backdropEl) {
      this.close();
    }
  }

  /* private handleResize() {
    if (!this.wrapperEl.classList.contains("hidden")) {
      this.close();
    }
  } */

  destroy() {
    this.triggerElements?.forEach((el) => {
      el.removeEventListener("click", this.boundToggle);
    });
    this.backdropEl?.removeEventListener("click", this.boundCloseOnBackdrop);
    // window.removeEventListener("resize", this.boundResizeHandler);
  }
}
