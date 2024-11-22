// lib/sessionHandler.ts
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

interface SessionConfig {
  timeoutMinutes: number
  warningMinutes: number
  onTimeout: () => void
  onWarning: () => void
}

export class SessionHandler {
  private lastActivity: number
  private timeoutTimer: NodeJS.Timeout | null
  private warningTimer: NodeJS.Timeout | null
  private config: SessionConfig

  constructor(config: SessionConfig) {
    this.lastActivity = Date.now()
    this.timeoutTimer = null
    this.warningTimer = null
    this.config = config

    // Initialize activity monitoring
    this.initActivityMonitoring()
    // Start session monitoring
    this.resetTimers()
  }

  private initActivityMonitoring() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    events.forEach(event => {
      window.addEventListener(event, () => {
        this.updateLastActivity()
      })
    })

    // Monitor auth state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.resetTimers()
      } else {
        this.clearTimers()
      }
    })
  }

  private updateLastActivity() {
    this.lastActivity = Date.now()
    this.resetTimers()
  }

  private resetTimers() {
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer)
    if (this.warningTimer) clearTimeout(this.warningTimer)

    const { timeoutMinutes, warningMinutes, onTimeout, onWarning } = this.config

    this.warningTimer = setTimeout(() => {
      onWarning()
    }, warningMinutes * 60 * 1000)

    this.timeoutTimer = setTimeout(() => {
      onTimeout()
    }, timeoutMinutes * 60 * 1000)
  }

  private clearTimers() {
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer)
    if (this.warningTimer) clearTimeout(this.warningTimer)
  }

  public destroy() {
    this.clearTimers()
  }
}