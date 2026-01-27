// Supabase Client Configuration
import { createBrowserClient } from '@supabase/ssr'

// For demo purposes, we'll use local storage to simulate a database
// In production, replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Types for our database
export interface Tour {
  id: string
  name: string
  description: string
  city: string
  theme: string
  cover_image: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Stop {
  id: string
  tour_id: string
  stop_number: number
  name: string
  address: string
  story_text: string
  instructions: string
  menu_items: string[]
  tips: string[]
  verification_type: 'text' | 'gps' | 'photo' | 'multiple_choice'
  password: string
  options?: string[] // For multiple choice
  correct_answer?: string // For multiple choice
  is_info_only?: boolean // For "Story Mode" stops
  media_type?: 'image' | 'video' | 'youtube'
  background_image?: string | null
  failures_allowed?: number // Default 3
  auto_show_hint?: boolean // Default true
  enable_skip?: boolean // Default true

  gps_lat: number | null
  gps_lng: number | null
  gps_radius: number
  image_url: string | null
  transition_text: string
  next_stop_preview: string
  created_at: string
}

// ... existing code ...

// Demo mode utilities - simulates Supabase for the demo
class DemoDatabase {
  private tours: Tour[] = []
  private stops: Stop[] = []
  private initialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const toursData = localStorage.getItem('mystery_served_tours')
      const stopsData = localStorage.getItem('mystery_served_stops')
      const dataVersion = localStorage.getItem('ms_data_version')
      const CURRENT_VERSION = '3'

      if (toursData) this.tours = JSON.parse(toursData)
      if (stopsData) this.stops = JSON.parse(stopsData)

      // Seed demo data if empty OR version mismatch (force update to new passwords/defaults)
      if (this.tours.length === 0 || dataVersion !== CURRENT_VERSION) {
        this.seedDemoData()
        localStorage.setItem('ms_data_version', CURRENT_VERSION)
      }

      this.initialized = true
    } catch {
      this.tours = []
      this.stops = []
      this.seedDemoData()
    }
  }

  private seedDemoData() {
    const tourId = 'demo-sherlock-tour'
    const now = new Date().toISOString()

    // The Sherlock Holmes Tour - Based on client's actual content
    this.tours = [{
      id: tourId,
      name: 'The Sherlock Holmes Institute Final Exam',
      description: 'Welcome, recruit! You have been selected for the final examination at the Sherlock Holmes Institute. Visit local restaurants, solve puzzles, and prove your detective skills to earn your certification as a Sunshine Agent.',
      city: 'St. Petersburg, FL',
      theme: 'detective',
      cover_image: null,
      is_active: true,
      created_at: now,
      updated_at: now
    }]

    this.stops = [
      {
        id: 'stop-1',
        tour_id: tourId,
        stop_number: 1,
        name: 'Mystery Served HQ',
        address: '116 Central Ave, St. Petersburg, FL 33701',
        story_text: 'Welcome, Detective Trainee! Your application to the Mystery Served Investigations unit has been received. Before we can process your credentials, you must complete your first assignment.',
        instructions: 'Ask the server for your "Employment Application" envelope. Inside you\'ll find a case file with hidden clues. Look carefully at the Case File Numbers - the code is usually a simple 4-digit pin like 1212!',
        menu_items: ['Cuban Sandwich', 'Café con Leche', 'Croquetas'],
        tips: ['The Cuban comes highly recommended!', 'Ask for half to-go for later stops'],
        verification_type: 'text',
        password: '1212',
        is_info_only: false,
        failures_allowed: 2,
        auto_show_hint: true,
        enable_skip: true,
        gps_lat: 27.7706,
        gps_lng: -82.6366,
        gps_radius: 50,
        image_url: null,
        media_type: 'image',
        transition_text: 'Excellent work, recruit! Your observation skills are promising.',
        next_stop_preview: 'Head to Bodega on Central for your next assignment.',
        created_at: now
      },
      {
        id: 'stop-2',
        tour_id: tourId,
        stop_number: 2,
        name: 'Bodega on Central',
        address: '1120 Central Ave, St. Petersburg, FL 33705',
        story_text: 'You\'ve arrived at the Bodega. The Cuban comes highly recommended here. Once you\'ve ordered, speak to the waitress about your "detective training materials."',
        instructions: 'Ask the waitress for the silver lockbox. The first clue is a classic detective word... maybe "mystery"? Once open, use the slide ruler inside to decode your next password.',
        menu_items: ['Cuban Sandwich', 'Media Noche', 'Ropa Vieja'],
        tips: ['Request half wrapped to-go', 'The dance is the Electric Slide!'],
        verification_type: 'text',
        password: 'mystery',
        is_info_only: false,
        failures_allowed: 2,
        auto_show_hint: true,
        enable_skip: true,
        gps_lat: 27.7710,
        gps_lng: -82.6500,
        gps_radius: 50,
        image_url: null,
        media_type: 'image',
        transition_text: 'Well done! You\'ve cracked the cipher. The next location awaits.',
        next_stop_preview: 'Your next stop is Kalamazoo - cross over 10th Ave.',
        created_at: now
      },
      {
        id: 'stop-3',
        tour_id: tourId,
        stop_number: 3,
        name: 'Kalamazoo',
        address: '1400 Central Ave, St. Petersburg, FL 33705',
        story_text: 'Intelligence suggests this location may be compromised. Use your detective instincts to complete this assignment quickly.',
        instructions: 'Order a drink and ask the bartender for the "classified envelope." Inside is a word scramble puzzle. Unscramble the letters to reveal the password.',
        menu_items: ['Craft Beer Selection', 'Wings', 'Sliders'],
        tips: ['Great happy hour specials!'],
        verification_type: 'text',
        password: 'MAGNIFY',
        is_info_only: false,
        failures_allowed: 2,
        auto_show_hint: true,
        enable_skip: true,
        gps_lat: 27.7712,
        gps_lng: -82.6550,
        gps_radius: 50,
        image_url: null,
        transition_text: 'Your instincts are sharp! One more stop remains.',
        next_stop_preview: 'Head to Poppo\'s for your burrito briefing.',
        created_at: now
      },
      {
        id: 'stop-4',
        tour_id: tourId,
        stop_number: 4,
        name: 'Poppo\'s Taqueria',
        address: '1600 Central Ave, St. Petersburg, FL 33705',
        story_text: 'Welcome to stop number four! You found your way through the investigation. Check out the menu - you have rice options, bean options, cheese options, and protein options with cold toppings included.',
        instructions: 'We recommend the chicken with black beans and white rice! Ask your server for the final puzzle. The menu items contain hidden numbers - combine them in order for your access code.',
        menu_items: ['Build Your Own Burrito', 'Chicken Bowl', 'Carnitas Tacos'],
        tips: ['Chicken with black beans and white rice is the local favorite!', 'Don\'t forget the Celsius drink!'],
        verification_type: 'text',
        password: '4521',
        is_info_only: false,
        failures_allowed: 2,
        auto_show_hint: true,
        enable_skip: true,
        gps_lat: 27.7715,
        gps_lng: -82.6600,
        gps_radius: 50,
        image_url: null,
        transition_text: 'Outstanding work! Proceed to your final examination.',
        next_stop_preview: 'The final stop awaits - prepare for the blacklight reveal!',
        created_at: now
      },
      {
        id: 'stop-5',
        tour_id: tourId,
        stop_number: 5,
        name: 'The Final Examination',
        address: '2000 Central Ave, St. Petersburg, FL 33705',
        story_text: 'Agents, the mission has brought you to your final stop. The city streets hum with music, the band is playing, and the dolphins are dancing — your task is simple, but requires teamwork.',
        instructions: 'Check your assignment numbers: each menu item contains a single digit. Combine them in order to form the 4-digit access code. BONUS: Use the blacklight on the table to reveal the secret dessert menu and get 15% off your next tour!',
        menu_items: ['Coffee', 'Hot Chocolate', 'Secret Dessert Menu (use blacklight!)'],
        tips: ['Work together on this one!', 'The blacklight reveals hidden surprises!'],
        verification_type: 'text',
        password: 'AGENT',
        auto_show_hint: true,
        enable_skip: true,
        gps_lat: 27.7720,
        gps_lng: -82.6650,
        gps_radius: 50,
        image_url: null,
        transition_text: 'CONGRATULATIONS! You have completed the Sherlock Holmes Institute Final Exam!',
        next_stop_preview: 'You are now a certified Sunshine Agent!',
        created_at: now
      }
    ]

    this.saveToStorage()
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mystery_served_tours', JSON.stringify(this.tours))
      localStorage.setItem('mystery_served_stops', JSON.stringify(this.stops))
    }
  }

  // Tour CRUD
  async getTours(): Promise<Tour[]> {
    return [...this.tours].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async getTour(id: string): Promise<Tour | null> {
    return this.tours.find(t => t.id === id) || null
  }

  async createTour(tour: Omit<Tour, 'id' | 'created_at' | 'updated_at'>): Promise<Tour> {
    const newTour: Tour = {
      ...tour,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    this.tours.push(newTour)
    this.saveToStorage()
    return newTour
  }

  async updateTour(id: string, updates: Partial<Tour>): Promise<Tour | null> {
    const index = this.tours.findIndex(t => t.id === id)
    if (index === -1) return null
    this.tours[index] = { ...this.tours[index], ...updates, updated_at: new Date().toISOString() }
    this.saveToStorage()
    return this.tours[index]
  }

  async deleteTour(id: string): Promise<boolean> {
    const index = this.tours.findIndex(t => t.id === id)
    if (index === -1) return false
    this.tours.splice(index, 1)
    // Also delete associated stops
    this.stops = this.stops.filter(s => s.tour_id !== id)
    this.saveToStorage()
    return true
  }

  async duplicateTour(id: string): Promise<Tour | null> {
    const original = this.tours.find(t => t.id === id)
    if (!original) return null

    const newTour = await this.createTour({
      name: `${original.name} (Copy)`,
      description: original.description,
      city: original.city,
      theme: original.theme,
      cover_image: original.cover_image,
      is_active: false
    })

    // Duplicate all stops
    const originalStops = this.stops.filter(s => s.tour_id === id)
    for (const stop of originalStops) {
      await this.createStop({
        tour_id: newTour.id,
        stop_number: stop.stop_number,
        name: stop.name,
        address: stop.address,
        story_text: stop.story_text,
        instructions: stop.instructions,
        menu_items: [...stop.menu_items],
        tips: [...stop.tips],
        verification_type: stop.verification_type,
        password: stop.password,
        gps_lat: stop.gps_lat,
        gps_lng: stop.gps_lng,
        gps_radius: stop.gps_radius,
        image_url: stop.image_url,
        transition_text: stop.transition_text,
        next_stop_preview: stop.next_stop_preview
      })
    }

    return newTour
  }

  // Stop CRUD
  async getStops(tourId: string): Promise<Stop[]> {
    return this.stops
      .filter(s => s.tour_id === tourId)
      .sort((a, b) => a.stop_number - b.stop_number)
  }

  async getStop(id: string): Promise<Stop | null> {
    return this.stops.find(s => s.id === id) || null
  }

  async createStop(stop: Omit<Stop, 'id' | 'created_at'>): Promise<Stop> {
    const newStop: Stop = {
      ...stop,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }
    this.stops.push(newStop)
    this.saveToStorage()
    return newStop
  }

  async updateStop(id: string, updates: Partial<Stop>): Promise<Stop | null> {
    const index = this.stops.findIndex(s => s.id === id)
    if (index === -1) return null
    this.stops[index] = { ...this.stops[index], ...updates }
    this.saveToStorage()
    return this.stops[index]
  }

  async deleteStop(id: string): Promise<boolean> {
    const index = this.stops.findIndex(s => s.id === id)
    if (index === -1) return false
    this.stops.splice(index, 1)
    this.saveToStorage()
    return true
  }

  async reorderStops(tourId: string, stopIds: string[]): Promise<void> {
    stopIds.forEach((id, index) => {
      const stop = this.stops.find(s => s.id === id)
      if (stop) {
        stop.stop_number = index + 1
      }
    })
    this.saveToStorage()
  }

  // Reset to seed data
  async resetToDemo(): Promise<void> {
    this.tours = []
    this.stops = []
    this.seedDemoData()
  }

  // Export/Import for manual syncing between devices
  exportData(): string {
    return btoa(JSON.stringify({ tours: this.tours, stops: this.stops }))
  }

  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(atob(data))
      if (parsed.tours && parsed.stops) {
        this.tours = parsed.tours
        this.stops = parsed.stops
        this.saveToStorage()
        return true
      }
      return false
    } catch {
      return false
    }
  }
}

export const demoDB = new DemoDatabase()
