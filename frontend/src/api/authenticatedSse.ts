export type AuthenticatedSseOptions = {
  onOpen?: () => void;
  onConnected?: () => void;
  onMessage?: (data: string) => void;
  onError?: (error: unknown) => void;
};

export function connectAuthenticatedSse(
  url: string,
  options: AuthenticatedSseOptions
) {
  const controller = new AbortController();

  let stopped = false;
  let retryDelay = 1000;

  const MAX_RETRY_DELAY = 15000;

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, ms);

      controller.signal.addEventListener(
        "abort",
        () => {
          window.clearTimeout(timeout);
          resolve();
        },
        { once: true }
      );
    });

  async function run() {
    while (!stopped && !controller.signal.aborted) {
      try {
        const token = localStorage.getItem("aegis-token");

        if (!token) {
          throw new Error("JWT token missing");
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `SSE authentication failed: HTTP ${response.status}`
          );
        }

        if (!response.ok) {
          throw new Error(
            `SSE connection failed: HTTP ${response.status}`
          );
        }

        if (!response.body) {
          throw new Error("SSE response body missing");
        }

        retryDelay = 1000;
        options.onOpen?.();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (!stopped && !controller.signal.aborted) {
          const { value, done } = await reader.read();

          if (done) {
            throw new Error("SSE stream closed");
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          const blocks = buffer.split(/\r?\n\r?\n/);
          buffer = blocks.pop() ?? "";

          for (const block of blocks) {
            if (!block.trim()) continue;

            let eventName = "message";
            const dataLines: string[] = [];

            for (const line of block.split(/\r?\n/)) {
              if (line.startsWith("event:")) {
                eventName = line.slice(6).trim();
              }

              if (line.startsWith("data:")) {
                dataLines.push(
                  line.slice(5).trimStart()
                );
              }
            }

            const data = dataLines.join("\n");

            if (!data) continue;

            if (eventName === "connected") {
              options.onConnected?.();
            } else {
              options.onMessage?.(data);
            }
          }
        }
      } catch (error) {
        if (stopped || controller.signal.aborted) {
          break;
        }

        options.onError?.(error);

        await sleep(retryDelay);

        retryDelay = Math.min(
          retryDelay * 2,
          MAX_RETRY_DELAY
        );
      }
    }
  }

  void run();

  return () => {
    stopped = true;
    controller.abort();
  };
}
