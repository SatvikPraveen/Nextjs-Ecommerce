// File: app/(account)/profile/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ProfileForm } from '@/components/profile-form'
import { AddressBook } from '@/components/address-book'
import { PasswordChangeForm } from '@/components/password-change-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { getUserProfile } from '@/server/queries/users'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your account settings and personal information.',
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const userProfile = await getUserProfile(session.user.id)

  if (!userProfile) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Profile
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Manage your account settings and personal information
            </p>
          </div>
          <Badge variant={userProfile.emailVerified ? 'default' : 'destructive'}>
            {userProfile.emailVerified ? 'Verified' : 'Unverified'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Personal Information</h3>
            <p className="text-sm text-muted-foreground">
              Update your personal details and contact information.
            </p>
          </div>
          <Separator />
          <ProfileForm user={userProfile} />
        </TabsContent>

        <TabsContent value="addresses" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Address Book</h3>
            <p className="text-sm text-muted-foreground">
              Manage your shipping and billing addresses.
            </p>
          </div>
          <Separator />
          <AddressBook userId={userProfile.id} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Security Settings</h3>
            <p className="text-sm text-muted-foreground">
              Update your password and security preferences.
            </p>
          </div>
          <Separator />
          <PasswordChangeForm />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Account Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Manage your notification and privacy settings.
            </p>
          </div>
          <Separator />
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-base font-medium">Email Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about your order status
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional offers and news
                    </p>
                  </div>
                  <input type="checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Product Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new products
                    </p>
                  </div>
                  <input type="checkbox" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}