import { useNewComponent, useType } from "@hex-engine/core";
import { useUpdate } from "../Canvas";
import Timer from "./Timer";

export class AnimationFrame<T> {
  data: T;
  duration: number; // in ms
  onFrame: (() => void) | null;

  constructor(
    data: T,
    { duration, onFrame }: { duration: number; onFrame?: null | (() => void) }
  ) {
    this.data = data;
    this.duration = duration;
    this.onFrame = onFrame || null;
  }
}

type Props<T> = Array<AnimationFrame<T>>;

export type AnimationAPI<T> = {
  currentFrame: AnimationFrame<T>;
  pause(): void;
  play(): void;
  restart(): void;
};

export default function Animation<T>(props: Props<T>): AnimationAPI<T> {
  useType(Animation);

  const frames = props;
  const timer = useNewComponent(Timer);
  timer.disable();
  let currentFrameIndex = 0;

  function getCurrentFrame() {
    return frames[currentFrameIndex];
  }

  useUpdate(() => {
    if (timer.hasReachedSetTime()) {
      if (currentFrameIndex === frames.length - 1) {
        currentFrameIndex = 0;
      } else {
        currentFrameIndex++;
      }

      const currentFrame = getCurrentFrame();
      timer.setToTimeFromNow(currentFrame.duration);

      if (currentFrame.onFrame) {
        currentFrame.onFrame();
      }
    }
  });

  return {
    get currentFrame() {
      return getCurrentFrame();
    },

    pause() {
      timer.disable();
    },

    play() {
      timer.enable();
      timer.setToTimeFromNow(getCurrentFrame().duration);
    },

    restart() {
      currentFrameIndex = 0;
    },
  };
}
