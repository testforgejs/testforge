import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreatePipelineContextParams, MountReadyContext } from "../../../types.js";

import { createPipelineContext } from "../../core/createPipelineContext.js";
import { createPipeline } from "../../core/createPipeline.js";
import { createMountPipeline } from "../createMountPipeline.js";
import { executeMountPipeline } from "../executeMountPipeline.js";

vi.mock("../../core/createPipelineContext.js", () => ({
  createPipelineContext: vi.fn(),
}));
vi.mock("../../core/createPipeline.js", () => ({
  createPipeline: vi.fn(),
}));
vi.mock("../createMountPipeline.js", () => ({
  createMountPipeline: vi.fn(),
}));

const initialCtx = { stage: "initial" } as unknown as ReturnType<typeof createPipelineContext>;
const readyCtx = { stage: "ready" } as unknown as MountReadyContext;
const middleware = [] as unknown as ReturnType<typeof createMountPipeline>;

const mockCreatePipelineContext = vi.mocked(createPipelineContext);
const mockCreateMountPipeline = vi.mocked(createMountPipeline);
const mockCreatePipeline = vi.mocked(createPipeline);
const mockRun = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  mockCreatePipelineContext.mockReturnValue(initialCtx);
  mockCreateMountPipeline.mockReturnValue(middleware);
  mockCreatePipeline.mockReturnValue({ run: mockRun } as never);
  mockRun.mockReturnValue(readyCtx);
});

describe("executeMountPipeline", () => {
  it("creates the context, builds the mount pipeline, runs it, and returns the ready context", () => {
    const defaultMountOptions = { shallow: true };
    const mountOptions = { attachTo: "#app" };
    const extraOptions = { presetKey: "admin" };
    const presets = { admin: { manifest: [], defaults: {} } };
    const params: CreatePipelineContextParams = {
      defaultMountOptions,
      mountOptions,
      extraOptions,
      presets,
    };

    const result = executeMountPipeline(params);

    expect(result).toBe(readyCtx);
    expect(mockCreatePipelineContext).toHaveBeenCalledTimes(1);
    expect(mockCreatePipelineContext).toHaveBeenCalledWith(params);
    expect(mockCreateMountPipeline).toHaveBeenCalledTimes(1);
    expect(mockCreateMountPipeline).toHaveBeenCalledWith(initialCtx);
    expect(mockCreatePipeline).toHaveBeenCalledTimes(1);
    expect(mockCreatePipeline).toHaveBeenCalledWith(middleware);
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(mockRun).toHaveBeenCalledWith(initialCtx);

    expect(mockCreatePipelineContext.mock.invocationCallOrder[0]).toBeLessThan(
      mockCreateMountPipeline.mock.invocationCallOrder[0],
    );
    expect(mockCreateMountPipeline.mock.invocationCallOrder[0]).toBeLessThan(
      mockCreatePipeline.mock.invocationCallOrder[0],
    );
    expect(mockCreatePipeline.mock.invocationCallOrder[0]).toBeLessThan(
      mockRun.mock.invocationCallOrder[0],
    );
  });

  it("accepts omitted optional parameters without filling or modifying them", () => {
    const params: CreatePipelineContextParams = {};

    expect(executeMountPipeline(params)).toBe(readyCtx);
    expect(mockCreatePipelineContext).toHaveBeenCalledTimes(1);
    expect(mockCreatePipelineContext).toHaveBeenCalledWith(params);
    expect(params).toEqual({});
  });

  it("uses a fresh context for each execution", () => {
    const secondCtx = { stage: "second" } as unknown as ReturnType<typeof createPipelineContext>;
    const secondReadyCtx = { stage: "second-ready" } as unknown as MountReadyContext;
    mockCreatePipelineContext.mockReturnValueOnce(initialCtx).mockReturnValueOnce(secondCtx);
    mockRun.mockReturnValueOnce(readyCtx).mockReturnValueOnce(secondReadyCtx);

    expect(executeMountPipeline({})).toBe(readyCtx);
    expect(executeMountPipeline({})).toBe(secondReadyCtx);

    expect(mockCreateMountPipeline).toHaveBeenNthCalledWith(1, initialCtx);
    expect(mockCreateMountPipeline).toHaveBeenNthCalledWith(2, secondCtx);
    expect(mockRun).toHaveBeenNthCalledWith(1, initialCtx);
    expect(mockRun).toHaveBeenNthCalledWith(2, secondCtx);
  });

  it("stops before building the pipeline if context creation fails", () => {
    const error = new Error("Invalid pipeline context");
    mockCreatePipelineContext.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMountPipeline({})).toThrow(error);
    expect(mockCreateMountPipeline).not.toHaveBeenCalled();
    expect(mockCreatePipeline).not.toHaveBeenCalled();
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("stops before creating the executable pipeline if mount middleware setup fails", () => {
    const error = new Error("Cannot create mount middleware");
    mockCreateMountPipeline.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMountPipeline({})).toThrow(error);
    expect(mockCreatePipelineContext).toHaveBeenCalledTimes(1);
    expect(mockCreatePipeline).not.toHaveBeenCalled();
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("does not run the pipeline when building the executable pipeline fails", () => {
    const error = new Error("Cannot create pipeline");
    mockCreatePipeline.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMountPipeline({})).toThrow(error);
    expect(mockCreateMountPipeline).toHaveBeenCalledTimes(1);
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("propagates failures from the pipeline runner", () => {
    const error = new Error("Pipeline failed");
    mockRun.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => executeMountPipeline({})).toThrow(error);
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(mockRun).toHaveBeenCalledWith(initialCtx);
  });
});
