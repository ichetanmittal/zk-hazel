import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  FileText,
  AlertCircle,
  Bell,
  Archive
} from 'lucide-react'

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get notifications for this user
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'DEAL_CREATED':
      case 'DEAL_MATCHED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'VERIFICATION_COMPLETE':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'DOCUMENT_UPLOADED':
        return <FileText className="w-5 h-5 text-blue-600" />
      case 'STEP_COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'ACTION_REQUIRED':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return <Bell className="w-5 h-5 text-slate-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'DEAL_CREATED':
      case 'DEAL_MATCHED':
      case 'VERIFICATION_COMPLETE':
      case 'STEP_COMPLETED':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'ACTION_REQUIRED':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'DOCUMENT_UPLOADED':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800'
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Archive className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Stay updated on your deals and activities
        </p>
      </div>

      {/* Notifications List */}
      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read ? '' : 'border-l-4 border-l-blue-600'}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-sm">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {notification.message}
                    </p>

                    {notification.link && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          asChild
                        >
                          <a href={notification.link}>View Details</a>
                        </Button>
                      </div>
                    )}
                  </div>

                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-slate-600 dark:text-slate-400">
              You will see updates about your deals and activities here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
