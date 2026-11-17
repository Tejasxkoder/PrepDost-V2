import type { Server } from "node:http"

let shuttingDown = false

/** True once a stop signal arrived. The health check and keep-alive handling use it to steer traffic away. */
export const isShuttingDown = (): boolean => shuttingDown

interface ShutdownOptions {
  /** How long running requests may keep going before the process is stopped anyway. */
  drainMs: number
  /** Runs once the server has finished every request (close database, Redis...). */
  cleanup: () => Promise<void>
  exit?: (code: number) => void
}

export const createShutdown = (
  server: Server,
  { drainMs, cleanup, exit = process.exit }: ShutdownOptions
) => {
  return (signal: string): void => {
    if (shuttingDown) {
      console.log(`${signal} received again, exiting now`)
      exit(1)
      return
    }
    shuttingDown = true

    console.log(
      `${signal} received, finishing running requests (up to ${Math.round(drainMs / 1000)}s)`
    )

    const force = setTimeout(() => {
      console.error("Drain timed out, exiting with requests still running")
      exit(1)
    }, drainMs)
    force.unref()

    // A keep-alive connection that goes idle while we wait would keep server.close() from finishing.
    const sweep = setInterval(() => server.closeIdleConnections(), 500)
    sweep.unref()

    server.close(async (error) => {
      clearInterval(sweep)
      clearTimeout(force)

      try {
        await cleanup()
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError)
      }

      exit(error ? 1 : 0)
    })
    server.closeIdleConnections()
  }
}
