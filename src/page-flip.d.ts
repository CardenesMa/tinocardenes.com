// Types for the parts of StPageFlip (https://github.com/Nodlik/StPageFlip) this
// site uses. The library ships no types; it's loaded from a CDN through the
// import map in site/index.html.

declare module 'page-flip' {
  export interface FlipSettings {
    /** Base page size; with size "stretch" pages scale to the container, keeping this ratio. */
    width: number;
    height: number;
    size?: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    /** First and last pages stand alone, like the boards of a book. */
    showCover?: boolean;
    /** Show one page at a time when the container is narrower than two minWidth pages. */
    usePortrait?: boolean;
    startPage?: number;
    flippingTime?: number;
    drawShadow?: boolean;
    maxShadowOpacity?: number;
    showPageCorners?: boolean;
    /** Only flip when a corner is clicked, so clicks on the text don't turn pages. */
    disableFlipByClick?: boolean;
    mobileScrollSupport?: boolean;
  }

  export interface FlipEvent<T> {
    data: T;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: FlipSettings);
    loadFromHTML(pages: HTMLElement[]): void;
    /** Swaps in a new set of pages, staying on the current index. */
    updateFromHtml(pages: HTMLElement[]): void;
    /** Shows a page without animating the turn. */
    turnToPage(page: number): void;
    /** Animated turn to a page (one flip, however far away it is). */
    flip(page: number): void;
    flipNext(): void;
    flipPrev(): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    getOrientation(): 'portrait' | 'landscape';
    /** The settings in use, by reference: changing width and height changes the ratio the pages keep. */
    getSettings(): FlipSettings;
    /** Measures the book again (as on a window resize) and redraws the pages on view. */
    update(): void;
    on(event: 'init' | 'flip', callback: (e: FlipEvent<unknown>) => void): this;
    on(event: 'changeOrientation', callback: (e: FlipEvent<'portrait' | 'landscape'>) => void): this;
    /** States: 'read' (at rest), 'user_fold', 'fold_corner', 'flipping'. */
    on(event: 'changeState', callback: (e: FlipEvent<string>) => void): this;
  }
}
