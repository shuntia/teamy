import { PublicPageLayout } from '@/components/public-page-layout'
import { 
  MessageSquare, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  BarChart3, 
  FolderKanban, 
  DollarSign, 
  Wrench 
} from 'lucide-react'
import { StickyScroll } from '@/components/ui/sticky-scroll-reveal'
import { DemoRequestDialog } from '@/components/demo-request-dialog'

const stickyScrollContent = [
  {
    title: 'Communication Hub',
    description: 'Keep your team connected with announcements, threaded replies, reactions, and email notifications. Share updates with specific roles or the entire team. Real-time notifications ensure everyone stays informed.',
    content: (
      <div className="h-full w-full bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-8 w-8 text-cyan-600" />
            <h3 className="font-bold text-lg">Team Announcements</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Stay connected and informed with real-time updates</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Smart Planning',
    description: 'Schedule practices, meetings, and competitions with ease. RSVP tracking, recurring events, and calendar integration keep everyone organized. Automatic reminders and conflict detection prevent scheduling issues.',
    content: (
      <div className="h-full w-full bg-pink-50 dark:bg-pink-950 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-8 w-8 text-pink-600" />
            <h3 className="font-bold text-lg">Event Calendar</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Keep everyone on the same schedule</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Event Rosters',
    description: 'Assign students to Science Olympiad events with AI assistance. Automatic conflict detection and capacity limits ensure optimal team composition. Track member preferences and availability to build the perfect roster.',
    content: (
      <div className="h-full w-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardCheck className="h-8 w-8 text-indigo-600" />
            <h3 className="font-bold text-lg">AI-Powered Rosters</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Anatomy & Physiology</span>
              <span className="text-green-600">✓ 2/2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Disease Detectives</span>
              <span className="text-green-600">✓ 2/2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Forensics</span>
              <span className="text-orange-600">⚠ 1/2</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Testing Platform',
    description: 'Create and grade tests with multiple question types. AI-powered grading, proctoring tools, built-in calculator, and customizable score release. Support for multiple choice, short answer, and essay questions with automatic grading.',
    content: (
      <div className="h-full w-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-emerald-600" />
            <h3 className="font-bold text-lg">Test Creator</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered grading and proctoring</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Performance Analytics',
    description: 'Track team performance with detailed statistics and insights. Monitor attendance, test scores, and event participation at a glance. Generate reports and identify areas for improvement with data-driven insights.',
    content: (
      <div className="h-full w-full bg-orange-50 dark:bg-orange-950 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <h3 className="font-bold text-lg">Team Statistics</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Attendance Rate</span>
                <span className="font-semibold">94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: '94%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Test Completion</span>
                <span className="font-semibold">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{width: '88%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Team Organization',
    description: 'Manage clubs, teams, and members with powerful admin tools. Photo albums, file sharing, and customizable dashboard widgets. Everything you need to keep your team organized and running smoothly.',
    content: (
      <div className="h-full w-full bg-purple-50 dark:bg-purple-950 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <FolderKanban className="h-8 w-8 text-purple-600" />
            <h3 className="font-bold text-lg">Organization Tools</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage everything in one place</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Financial Management',
    description: 'Track event budgets and expenses effortlessly. Purchase request approval system with automatic budget enforcement and reporting. Never go over budget with real-time tracking and alerts.',
    content: (
      <div className="h-full w-full bg-green-50 dark:bg-green-950 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-8 w-8 text-green-600" />
            <h3 className="font-bold text-lg">Budget Overview</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Budget</span>
              <span className="font-semibold">$5,000</span>
            </div>
            <div className="flex justify-between">
              <span>Spent</span>
              <span className="text-orange-600">$3,200</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining</span>
              <span className="text-green-600">$1,800</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Essential Tools',
    description: 'Forms, to-do lists, attendance tracking, and more. Everything you need to run your Science Olympiad team efficiently in one place. Streamline your workflow with integrated tools designed for team management.',
    content: (
      <div className="h-full w-full bg-amber-50 dark:bg-amber-950 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-full">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="h-8 w-8 text-amber-600" />
            <h3 className="font-bold text-lg">Productivity Suite</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Forms, to-dos, and more</p>
        </div>
      </div>
    ),
  },
]

export default function FeaturesPage() {
  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your Science Olympiad team
          </p>
        </div>

        {/* Sticky Scroll Section - Full Width */}
        <StickyScroll content={stickyScrollContent} />

        {/* Schedule Demo CTA */}
        <div className="text-center mt-16 mb-8">
          <DemoRequestDialog />
        </div>
      </div>
    </PublicPageLayout>
  )
}
