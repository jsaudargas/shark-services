// Service catalogue + the intake questionnaire for each service.
// The booking funnel renders entirely from this file: add, remove or reorder a
// question here and the funnel, review screen and lead inbox follow.
//
// Pricing: intentionally absent. If the client confirms prices (e.g. the HVAC
// "$50 per unit" promo), add a `pricing` field per service and render it from
// here. Never hardcode prices in components.

import type { LucideIcon } from 'lucide-react'
import {
  AirVent,
  ArrowDownToLine,
  ArrowUpToLine,
  Box,
  Boxes,
  Building2,
  CircleDashed,
  CircleHelp,
  Cog,
  Disc3,
  Droplet,
  Fan,
  Gauge,
  Hammer,
  House,
  Layers,
  Leaf,
  Package,
  PaintRoller,
  PlugZap,
  Refrigerator,
  Search,
  Settings2,
  Snowflake,
  Sofa,
  Sparkles,
  Trees,
  Truck,
  WashingMachine,
  Wind,
  Wrench,
} from 'lucide-react'

export type ServiceId =
  | 'junk'
  | 'mechanic'
  | 'small-engine'
  | 'handyman'
  | 'snow-leaf'
  | 'dryer-vent'
  | 'hvac'
  | 'other'

export interface Option {
  value: string
  label: string
  hint?: string
  icon?: LucideIcon
  /** junk volume visual, 0-100 */
  fill?: number
}

interface FieldBase {
  id: string
  label: string
  /** short label used on the review screen and in the lead inbox */
  summaryLabel?: string
  required?: boolean
}

export type Field =
  | (FieldBase & { type: 'single'; options: Option[]; layout?: 'cards' | 'pills' | 'volume'; otherValue?: string; otherPlaceholder?: string })
  | (FieldBase & { type: 'multi'; options: Option[]; otherValue?: string; otherPlaceholder?: string })
  | (FieldBase & { type: 'text'; placeholder?: string; inputMode?: 'text' | 'numeric'; autoComplete?: string; list?: string[]; width?: 'full' | 'half' | 'third' })
  | (FieldBase & { type: 'textarea'; placeholder?: string; suggestions?: string[]; minLength?: number })
  | (FieldBase & { type: 'photos'; max?: number })

export interface Screen {
  id: string
  title: string
  sub?: string
  fields: Field[]
}

export interface Service {
  id: ServiceId
  name: string
  short: string
  blurb: string
  icon: LucideIcon
  image?: string
  /** what the visitor gets: shown on the services grid */
  examples: string[]
  screens: Screen[]
}

const photoField = (label = 'Photos (optional)'): Field => ({
  id: 'photos',
  type: 'photos',
  label,
  summaryLabel: 'Photos',
  max: 6,
})

const vehicleMakes = [
  'Acura', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai',
  'Infiniti', 'Jeep', 'Kia', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Ram', 'Subaru',
  'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
]

export const services: Service[] = [
  {
    id: 'junk',
    name: 'Junk Removal',
    short: 'Furniture, appliances, yard waste, cleanouts.',
    blurb: 'Single items to full cleanouts. Point at it, we haul it.',
    icon: Truck,
    image: '/images/svc-junk.webp',
    examples: ['Furniture', 'Appliances', 'Yard waste', 'Cleanouts'],
    screens: [
      {
        id: 'items',
        title: 'What needs to go?',
        sub: 'Pick everything that applies.',
        fields: [
          {
            id: 'items',
            type: 'multi',
            label: 'Items',
            summaryLabel: 'Items',
            required: true,
            otherValue: 'other',
            otherPlaceholder: 'e.g. hot tub, piano, old shed',
            options: [
              { value: 'furniture', label: 'Furniture', icon: Sofa },
              { value: 'appliances', label: 'Appliances', icon: Refrigerator },
              { value: 'yard', label: 'Yard waste', icon: Trees },
              { value: 'general', label: 'General junk', icon: Package },
              { value: 'cleanout', label: 'Full cleanout', icon: Boxes },
              { value: 'other', label: 'Something else', icon: CircleHelp },
            ],
          },
        ],
      },
      {
        id: 'amount',
        title: 'Roughly how much is there?',
        sub: 'A rough guess is fine. Photos fill in the rest.',
        fields: [
          {
            id: 'amount',
            type: 'single',
            layout: 'volume',
            label: 'Amount',
            summaryLabel: 'Amount',
            required: true,
            options: [
              { value: 'few', label: 'A few items', hint: '1 to 3 pieces', fill: 18 },
              { value: 'several', label: 'Several items', hint: 'A room or a corner', fill: 46 },
              { value: 'large', label: 'Large cleanout', hint: 'Garage, basement, whole house', fill: 92 },
              { value: 'unsure', label: 'Not sure', hint: 'We will help you size it', fill: 0 },
            ],
          },
        ],
      },
      {
        id: 'location',
        title: 'Where are the items?',
        sub: 'Helps the crew plan for stairs and carrying distance.',
        fields: [
          {
            id: 'location',
            type: 'single',
            layout: 'cards',
            label: 'Location',
            summaryLabel: 'Location',
            required: true,
            otherValue: 'other',
            otherPlaceholder: 'e.g. attic, storage unit, office',
            options: [
              { value: 'ground', label: 'Ground floor', icon: House },
              { value: 'upstairs', label: 'Upstairs', icon: ArrowUpToLine },
              { value: 'basement', label: 'Basement', icon: ArrowDownToLine },
              { value: 'outside', label: 'Outside', icon: Trees },
              { value: 'other', label: 'Somewhere else', icon: CircleHelp },
            ],
          },
        ],
      },
      {
        id: 'photos',
        title: 'Got photos? Add a few.',
        sub: 'Photos help the team size the job before calling you back. Totally optional.',
        fields: [photoField()],
      },
    ],
  },
  {
    id: 'mechanic',
    name: 'Mechanic Services',
    short: 'Diagnostics, brakes, oil changes, tune-ups.',
    blurb: 'Diagnostics, repairs and routine maintenance for your vehicle.',
    icon: Wrench,
    image: '/images/svc-mechanic.webp',
    examples: ['Diagnostics', 'Brakes', 'Oil changes', 'Tune-ups'],
    screens: [
      {
        id: 'need',
        title: 'What does your vehicle need?',
        fields: [
          {
            id: 'need',
            type: 'single',
            layout: 'cards',
            label: 'Service',
            summaryLabel: 'Needs',
            required: true,
            otherValue: 'other',
            otherPlaceholder: 'Tell us in a few words',
            options: [
              { value: 'diagnostics', label: 'Diagnostics', hint: 'Warning light, odd noise', icon: Gauge },
              { value: 'brakes', label: 'Brakes', hint: 'Pads, rotors, squeaks', icon: Disc3 },
              { value: 'oil', label: 'Oil change', icon: Droplet },
              { value: 'maintenance', label: 'Maintenance', hint: 'Tune-up, fluids, filters', icon: Settings2 },
              { value: 'repairs', label: 'Repairs', hint: 'Something is broken', icon: Wrench },
              { value: 'other', label: 'Something else', icon: CircleHelp },
            ],
          },
        ],
      },
      {
        id: 'vehicle',
        title: 'Which vehicle is it?',
        sub: 'Make and model are enough. Year helps if you know it.',
        fields: [
          { id: 'year', type: 'text', label: 'Year', summaryLabel: 'Year', inputMode: 'numeric', placeholder: '2016', width: 'third' },
          { id: 'make', type: 'text', label: 'Make', summaryLabel: 'Make', required: true, placeholder: 'Ford', list: vehicleMakes, width: 'third' },
          { id: 'model', type: 'text', label: 'Model', summaryLabel: 'Model', required: true, placeholder: 'F-150', width: 'third' },
        ],
      },
      {
        id: 'issue',
        title: "What's going on with it?",
        sub: 'A sentence or two is plenty. Skip it if you are not sure.',
        fields: [
          {
            id: 'issue',
            type: 'textarea',
            label: 'Describe the issue',
            summaryLabel: 'Issue',
            placeholder: 'e.g. Grinding noise when braking, started last week.',
            suggestions: ['Check engine light is on', 'Squeaking when I brake', "Won't start", 'Due for an oil change'],
          },
        ],
      },
    ],
  },
  {
    id: 'small-engine',
    name: 'Small Engine Maintenance',
    short: 'Mowers, trimmers, blowers, generators.',
    blurb: 'Get mowers, blowers, chainsaws and generators running right.',
    icon: Cog,
    image: '/images/svc-small-engine.webp',
    examples: ['Mowers', 'Blowers', 'Chainsaws', 'Generators'],
    screens: [
      {
        id: 'equipment',
        title: 'What equipment is it?',
        fields: [
          {
            id: 'equipment',
            type: 'single',
            layout: 'pills',
            label: 'Equipment',
            summaryLabel: 'Equipment',
            required: true,
            otherValue: 'other',
            otherPlaceholder: 'e.g. pressure washer',
            options: [
              { value: 'mower', label: 'Lawn mower' },
              { value: 'trimmer', label: 'Trimmer' },
              { value: 'blower', label: 'Leaf blower' },
              { value: 'chainsaw', label: 'Chainsaw' },
              { value: 'generator', label: 'Generator' },
              { value: 'snowblower', label: 'Snow blower' },
              { value: 'other', label: 'Something else' },
            ],
          },
        ],
      },
      {
        id: 'service',
        title: 'What does it need?',
        fields: [
          {
            id: 'service',
            type: 'single',
            layout: 'cards',
            label: 'Service',
            summaryLabel: 'Service',
            required: true,
            options: [
              { value: 'repair', label: 'Repair', hint: "It won't start or run right", icon: Wrench },
              { value: 'tuneup', label: 'Tune-up', hint: 'Get it ready for the season', icon: Settings2 },
              { value: 'maintenance', label: 'Maintenance', hint: 'Oil, plugs, blades, filters', icon: Droplet },
              { value: 'unsure', label: 'Not sure', hint: 'We will take a look', icon: CircleHelp },
            ],
          },
        ],
      },
      {
        id: 'details',
        title: 'Anything else we should know?',
        sub: 'Optional. Brand, symptoms, or a photo of the machine all help.',
        fields: [
          {
            id: 'details',
            type: 'textarea',
            label: 'Details',
            summaryLabel: 'Details',
            placeholder: 'e.g. Honda mower, starts then dies after a few seconds.',
            suggestions: ["Won't start", 'Starts then stalls', 'Smoking', 'Needs sharpening'],
          },
          photoField(),
        ],
      },
    ],
  },
  {
    id: 'handyman',
    name: 'Handyman Services',
    short: 'Repairs, installs, fix-ups, improvements.',
    blurb: 'The list of small jobs you keep meaning to get to.',
    icon: Hammer,
    image: '/images/svc-handyman.webp',
    examples: ['Repairs', 'Installations', 'Fix-ups', 'Improvements'],
    screens: [
      {
        id: 'type',
        title: 'What kind of project?',
        fields: [
          {
            id: 'type',
            type: 'single',
            layout: 'cards',
            label: 'Project type',
            summaryLabel: 'Project',
            required: true,
            otherValue: 'other',
            otherPlaceholder: 'Tell us in a few words',
            options: [
              { value: 'repair', label: 'Repair', hint: 'Fix something broken', icon: Wrench },
              { value: 'install', label: 'Installation', hint: 'Mount, hang, assemble', icon: PlugZap },
              { value: 'fix', label: 'General fix', hint: 'Doors, drywall, odd jobs', icon: Hammer },
              { value: 'improve', label: 'Improvement', hint: 'Upgrade a space', icon: PaintRoller },
              { value: 'other', label: 'Something else', icon: CircleHelp },
            ],
          },
        ],
      },
      {
        id: 'size',
        title: 'How big is the job?',
        fields: [
          {
            id: 'size',
            type: 'single',
            layout: 'cards',
            label: 'Job size',
            summaryLabel: 'Size',
            required: true,
            options: [
              { value: 'small', label: 'Small job', hint: 'One quick task', icon: Box },
              { value: 'multiple', label: 'Multiple tasks', hint: 'A short list', icon: Layers },
              { value: 'large', label: 'Larger project', hint: 'A day or more of work', icon: Boxes },
              { value: 'unsure', label: 'Not sure', icon: CircleHelp },
            ],
          },
        ],
      },
      {
        id: 'describe',
        title: 'Describe the job.',
        sub: 'What needs doing and where. A photo of the problem helps a lot.',
        fields: [
          {
            id: 'describe',
            type: 'textarea',
            label: 'Job description',
            summaryLabel: 'Description',
            required: true,
            minLength: 8,
            placeholder: 'e.g. Hang a 65" TV on drywall and fix a sticking closet door.',
          },
          photoField(),
        ],
      },
    ],
  },
  {
    id: 'snow-leaf',
    name: 'Snow & Leaf Removal',
    short: 'Plowing, shoveling, salting, leaf cleanup.',
    blurb: 'Clear driveways and lots in winter, clean yards in the fall.',
    icon: Snowflake,
    image: '/images/svc-snow.webp',
    examples: ['Plowing', 'Shoveling', 'Salting', 'Leaf cleanup'],
    screens: [
      {
        id: 'work',
        title: 'What do you need done?',
        sub: 'Pick everything that applies.',
        fields: [
          {
            id: 'work',
            type: 'multi',
            label: 'Work',
            summaryLabel: 'Work',
            required: true,
            options: [
              { value: 'plowing', label: 'Snow plowing', icon: Truck },
              { value: 'shoveling', label: 'Shoveling', icon: Snowflake },
              { value: 'salting', label: 'Salting', icon: Sparkles },
              { value: 'leaves', label: 'Leaf cleanup', icon: Leaf },
              { value: 'hauling', label: 'Hauling away', icon: Package },
            ],
          },
        ],
      },
      {
        id: 'property',
        title: 'What type of property?',
        fields: [
          {
            id: 'property',
            type: 'single',
            layout: 'cards',
            label: 'Property type',
            summaryLabel: 'Property',
            required: true,
            options: [
              { value: 'residential', label: 'Residential', hint: 'House, driveway, yard', icon: House },
              { value: 'commercial', label: 'Commercial', hint: 'Lot, storefront, building', icon: Building2 },
            ],
          },
        ],
      },
      {
        id: 'area',
        title: 'About how big is the area?',
        fields: [
          {
            id: 'area',
            type: 'single',
            layout: 'pills',
            label: 'Area size',
            summaryLabel: 'Area',
            required: true,
            options: [
              { value: 'single', label: 'Single driveway' },
              { value: 'double', label: 'Double driveway' },
              { value: 'yard', label: 'Average yard' },
              { value: 'large-lot', label: 'Large property' },
              { value: 'commercial-lot', label: 'Commercial lot' },
              { value: 'unsure', label: 'Not sure' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'dryer-vent',
    name: 'Dryer Vent Cleanouts',
    short: 'Lint removal, airflow, inspections.',
    blurb: 'Clear built-up lint so your dryer can breathe again.',
    icon: WashingMachine,
    image: '/images/svc-dryer.webp',
    examples: ['Lint removal', 'Airflow', 'Inspections'],
    screens: [
      {
        id: 'service',
        title: 'What do you need?',
        fields: [
          {
            id: 'service',
            type: 'single',
            layout: 'cards',
            label: 'Service',
            summaryLabel: 'Service',
            required: true,
            options: [
              { value: 'routine', label: 'Routine cleaning', hint: "It's been a while", icon: Sparkles },
              { value: 'airflow', label: 'Airflow problem', hint: 'Clothes take forever to dry', icon: Wind },
              { value: 'inspection', label: 'Inspection', hint: 'Have it checked', icon: Search },
              { value: 'unsure', label: 'Not sure', icon: CircleHelp },
            ],
          },
        ],
      },
      {
        id: 'property',
        title: 'Where is the dryer?',
        fields: [
          {
            id: 'property',
            type: 'single',
            layout: 'cards',
            label: 'Property type',
            summaryLabel: 'Property',
            required: true,
            options: [
              { value: 'house', label: 'House', icon: House },
              { value: 'apartment', label: 'Apartment or condo', icon: Building2 },
              { value: 'commercial', label: 'Commercial', icon: Building2 },
            ],
          },
        ],
      },
      {
        id: 'notes',
        title: 'Anything else we should know?',
        sub: 'Optional. Vent location, how long since the last clean, any burning smell.',
        fields: [
          {
            id: 'notes',
            type: 'textarea',
            label: 'Notes',
            summaryLabel: 'Notes',
            placeholder: 'e.g. Vent goes out through the roof, never been cleaned.',
            suggestions: ['Vent exits through the roof', 'Vent exits through a wall', 'Dryer gets very hot'],
          },
        ],
      },
    ],
  },
  {
    id: 'hvac',
    name: 'HVAC Unit Cleaning',
    short: 'Seasonal cleaning and upkeep.',
    blurb: 'Seasonal cleaning to keep your units running efficiently.',
    icon: AirVent,
    image: '/images/svc-hvac.webp',
    examples: ['Seasonal cleaning', 'Maintenance', 'Airflow'],
    screens: [
      {
        id: 'units',
        title: 'How many units?',
        fields: [
          {
            id: 'units',
            type: 'single',
            layout: 'pills',
            label: 'Number of units',
            summaryLabel: 'Units',
            required: true,
            options: [
              { value: '1', label: '1 unit' },
              { value: '2', label: '2 units' },
              { value: '3', label: '3 units' },
              { value: '4+', label: '4 or more' },
              { value: 'unsure', label: 'Not sure' },
            ],
          },
        ],
      },
      {
        id: 'service',
        title: 'What are you looking for?',
        fields: [
          {
            id: 'service',
            type: 'single',
            layout: 'cards',
            label: 'Service type',
            summaryLabel: 'Service',
            required: true,
            options: [
              { value: 'seasonal', label: 'Seasonal cleaning', hint: 'Spring or fall clean', icon: Fan },
              { value: 'maintenance', label: 'Maintenance clean', hint: 'Routine upkeep', icon: Settings2 },
              { value: 'performance', label: 'Weak airflow', hint: 'Not blowing like it used to', icon: Wind },
              { value: 'unsure', label: 'Not sure', icon: CircleHelp },
            ],
          },
        ],
      },
      {
        id: 'details',
        title: 'Anything else we should know?',
        sub: 'Optional. Unit type, location, or a photo of the unit.',
        fields: [
          {
            id: 'details',
            type: 'textarea',
            label: 'Details',
            summaryLabel: 'Details',
            placeholder: 'e.g. Two mini-split heads upstairs, one outdoor condenser.',
            suggestions: ['Central AC', 'Mini-split', 'Window units', 'Rooftop unit'],
          },
          photoField(),
        ],
      },
    ],
  },
  {
    id: 'other',
    name: 'Something Else',
    short: "Not listed or not sure? Tell us.",
    blurb: "If it needs handling, describe it. We'll tell you if we can help.",
    icon: CircleDashed,
    examples: [],
    screens: [
      {
        id: 'describe',
        title: 'Tell us what you need.',
        sub: "Describe the job in your own words. We'll let you know if it's something we can take on.",
        fields: [
          {
            id: 'describe',
            type: 'textarea',
            label: 'Job description',
            summaryLabel: 'Description',
            required: true,
            minLength: 8,
            placeholder: 'e.g. Need a fallen tree limb cut up and removed from the backyard.',
          },
          photoField(),
        ],
      },
    ],
  },
]

export const serviceById = (id: string | null | undefined): Service | undefined =>
  services.find((s) => s.id === id)

export const isServiceId = (id: string | null | undefined): id is ServiceId => !!serviceById(id)
