'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

export function GrantForm() {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    // Club Information
    clubName: '',
    schoolName: '',
    schoolAddress: '',
    clubDivision: '',
    numberOfTeams: '',
    yearsParticipating: '',
    grantAmount: '',
    // Long Answers
    clubDescription: '',
    grantBenefit: '',
    suggestions: '',
    // Contact Information
    contactRole: '',
    // Officer/Captain fields
    applicantName: '',
    applicantEmail: '',
    confirmEmail: '',
    coachName: '',
    coachEmail: '',
  })

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.clubName || !formData.schoolName || !formData.schoolAddress || 
        !formData.clubDivision || !formData.numberOfTeams || !formData.yearsParticipating ||
        !formData.grantAmount || !formData.clubDescription || !formData.grantBenefit ||
        !formData.contactRole || !formData.applicantName || !formData.applicantEmail || !formData.confirmEmail) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    // Validate emails match
    if (formData.applicantEmail !== formData.confirmEmail) {
      toast({
        title: 'Email Mismatch',
        description: 'Email addresses do not match. Please check and try again.',
        variant: 'destructive',
      })
      return
    }

    // If officer/captain, coach info is required
    if (formData.contactRole === 'officer' && (!formData.coachName || !formData.coachEmail)) {
      toast({
        title: 'Coach Information Required',
        description: 'Please provide your coach\'s name and email.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/grant-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitted(true)
      toast({
        title: 'Application Submitted!',
        description: 'We will review your grant application and get back to you soon.',
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: 'Submission Failed',
        description: 'Please try again or contact us directly.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      clubName: '',
      schoolName: '',
      schoolAddress: '',
      clubDivision: '',
      numberOfTeams: '',
      yearsParticipating: '',
      grantAmount: '',
      clubDescription: '',
      grantBenefit: '',
      suggestions: '',
      contactRole: '',
      applicantName: '',
      applicantEmail: '',
      confirmEmail: '',
      coachName: '',
      coachEmail: '',
    })
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
        <p className="text-muted-foreground mb-6">
          Thank you for applying. We will review your application and contact you soon.
        </p>
        <Button onClick={resetForm}>
          Submit Another Application
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      {/* Club Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground border-b pb-2">Club Information</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clubName">Club Name *</Label>
            <Input
              id="clubName"
              value={formData.clubName}
              onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
              placeholder="e.g., Los Altos High Science Olympiad"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name *</Label>
            <Input
              id="schoolName"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              placeholder="e.g., Los Altos High School"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="schoolAddress">School Address *</Label>
          <Input
            id="schoolAddress"
            value={formData.schoolAddress}
            onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
            placeholder="Street Address, City, State, ZIP Code"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="clubDivision">Division *</Label>
            <Select
              value={formData.clubDivision}
              onValueChange={(value) => setFormData({ ...formData, clubDivision: value })}
            >
              <SelectTrigger id="clubDivision">
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B">Division B</SelectItem>
                <SelectItem value="C">Division C</SelectItem>
                <SelectItem value="B&C">Division B & C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfTeams">Number of Teams *</Label>
            <Input
              id="numberOfTeams"
              type="number"
              min="1"
              value={formData.numberOfTeams}
              onChange={(e) => setFormData({ ...formData, numberOfTeams: e.target.value })}
              placeholder="e.g., 2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearsParticipating">Years in Science Olympiad *</Label>
            <Input
              id="yearsParticipating"
              type="number"
              min="0"
              value={formData.yearsParticipating}
              onChange={(e) => setFormData({ ...formData, yearsParticipating: e.target.value })}
              placeholder="e.g., 5"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grantAmount">Requested Grant Amount ($) *</Label>
          <Input
            id="grantAmount"
            type="number"
            min="1"
            value={formData.grantAmount}
            onChange={(e) => setFormData({ ...formData, grantAmount: e.target.value })}
            placeholder="e.g., 500"
            required
          />
          <p className="text-xs text-muted-foreground">How much money are you requesting from this grant?</p>
        </div>
      </div>

      {/* Long Answers */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground border-b pb-2">Tell Us About Your Club</h3>
        
        <div className="space-y-2">
          <Label htmlFor="clubDescription">Thoroughly describe your club and goals. *</Label>
          <Textarea
            id="clubDescription"
            value={formData.clubDescription}
            onChange={(e) => setFormData({ ...formData, clubDescription: e.target.value })}
            placeholder="Tell us about your club's history, current situation, goals, and what makes your club unique..."
            rows={5}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grantBenefit">If your grant is approved, how would it benefit your team? Be specific. *</Label>
          <Textarea
            id="grantBenefit"
            value={formData.grantBenefit}
            onChange={(e) => setFormData({ ...formData, grantBenefit: e.target.value })}
            placeholder="Explain how the grant money would be used and what impact it would have on your team..."
            rows={5}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="suggestions">Do you have any suggestions for Teamy? What features or improvements would you like to see?</Label>
          <Textarea
            id="suggestions"
            value={formData.suggestions}
            onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
            placeholder="Share any feedback or feature suggestions you have for Teamy..."
            rows={3}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground border-b pb-2">Contact Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="contactRole">Your role in the club *</Label>
          <Select
            value={formData.contactRole}
            onValueChange={(value) => setFormData({ ...formData, contactRole: value })}
          >
            <SelectTrigger id="contactRole">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="officer">Officer / Captain</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="applicantName">Your Name *</Label>
            <Input
              id="applicantName"
              value={formData.applicantName}
              onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicantEmail">Your Email *</Label>
            <Input
              id="applicantEmail"
              type="email"
              value={formData.applicantEmail}
              onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmEmail">Confirm Email *</Label>
          <Input
            id="confirmEmail"
            type="email"
            value={formData.confirmEmail}
            onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
            placeholder="Confirm your email"
            required
          />
        </div>

        {formData.contactRole === 'officer' && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Since you are an officer/captain, please provide your coach&apos;s information:</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coachName">Coach&apos;s Name *</Label>
                <Input
                  id="coachName"
                  value={formData.coachName}
                  onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                  placeholder="Coach's full name"
                  required={formData.contactRole === 'officer'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coachEmail">Coach&apos;s Email *</Label>
                <Input
                  id="coachEmail"
                  type="email"
                  value={formData.coachEmail}
                  onChange={(e) => setFormData({ ...formData, coachEmail: e.target.value })}
                  placeholder="coach.email@school.edu"
                  required={formData.contactRole === 'officer'}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Please note:</strong> We will fact-check your responses before approving your grant application. There is no guarantee that your grant will be approved. Priority is given to underfunded and developing clubs.
        </p>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={submitting} className="w-full bg-teamy-primary hover:bg-teamy-primary-dark">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Application'
        )}
      </Button>
    </form>
  )
}

