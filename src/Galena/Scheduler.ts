import type { Task } from "./types";
import { Priority } from "./types";

/**
 * Scheduler
 *
 * Scheduling dispatched events to state consumers is how Galena
 * out-performs just about every state management library out there.
 * The scheduler offers the ability to dispatch state updates on 3
 * priorities:
 *
 * 1. Immediate - Immediate synchronous task execution and propagation of
 * changes to consumers
 * 2. Microtask - Immediate task execution and scheduled propagation of
 * changes to consumers
 * 3. Background - Immediate task execution and batched propagation of
 * changes to consumers
 *
 * This module manages the propagation of changes to State consumers
 * by implementing the three priorities outlined above
 */
export class Scheduler<T extends Task = Task> {
  private task: null | T = null;
  private schedule: ReturnType<typeof setTimeout> | null = null;

  /**
   * Schedule Task
   *
   * Given a task (the emission of state changes to consumers)
   * and a priority, this method executes the task on the priority
   * level specified
   */
  protected scheduleTask(task: T, priority: Priority) {
    switch (priority) {
      case Priority.IMMEDIATE:
        this.task = task;
        return this.executeTasks();
      case Priority.MICROTASK:
        return Promise.resolve().then(() => {
          this.task = task;
          return this.executeTasks();
        });
      case Priority.BACKGROUND:
      default:
        if (this.task && this.schedule) {
          return;
        }
        this.task = task;
        this.createSchedule();
    }
  }

  /**
   * Create Schedule
   *
   * Schedules the execution of the current task after 5 milliseconds
   */
  private createSchedule() {
    this.clearSchedule();
    this.schedule = setTimeout(() => {
      this.executeTasks();
    }, 5);
  }

  /**
   * Clear Schedule
   *
   * Clears the schedule if it exists
   */
  private clearSchedule() {
    if (this.schedule !== null) {
      clearTimeout(this.schedule);
      this.schedule = null;
    }
  }

  /**
   * Execute Tasks
   *
   * Clears the schedule if it exists and executes the current task
   */
  private executeTasks() {
    this.clearSchedule();
    this.task?.();
    this.task = null;
  }
}
