'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { CalendarCheck } from 'lucide-react'

interface DemoRequestDialogProps {
  buttonText?: string
  fieldLabel?: string
  fieldPlaceholder?: string
  apiEndpoint?: string
}

export function DemoRequestDialog({ 
  buttonText = 'Schedule Demo!',
  fieldLabel = 'School Name',
  fieldPlaceholder = 'Your School Name',
  apiEndpoint = '/api/demo-requests'
}: DemoRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [fieldValue, setFieldValue] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          schoolName: fieldValue, // Keep backend field name consistent
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit demo request')
      }

      toast({
        title: 'Demo request submitted!',
        description: "We'll reach out to you soon to schedule a demo.",
      })

      setEmail('')
      setFieldValue('')
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit demo request',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="gap-2 bg-teamy-primary hover:bg-teamy-primary-dark text-white shadow-lg hover:shadow-xl transition-all"
        >
          <CalendarCheck className="h-5 w-5" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a Demo</DialogTitle>
          <DialogDescription>
            Fill out this quick form and we&apos;ll reach out to schedule a personalized demo of Teamy.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fieldValue">{fieldLabel} *</Label>
            <Input
              id="fieldValue"
              type="text"
              placeholder={fieldPlaceholder}
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teamy-primary hover:bg-teamy-primary-dark"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
