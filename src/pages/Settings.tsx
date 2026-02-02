import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  CreditCard,
  Target,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { requestNotificationPermission, getNotificationPermission } from '@/lib/notifications';
import { ProfileEditModal } from '@/components/settings/ProfileEditModal';
import { GoalManagementModal } from '@/components/settings/GoalManagementModal';
import { AssetManagementModal } from '@/components/settings/AssetManagementModal';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // 모달 상태
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [assetModalOpen, setAssetModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success('로그아웃되었습니다');
      navigate('/auth');
    } catch (error) {
      toast.error('로그아웃 실패');
      console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast.success('알림 권한이 허용되었습니다');
      } else {
        setNotificationsEnabled(false);
        toast.error('알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
      }
    } else {
      setNotificationsEnabled(false);
      toast.info('알림이 비활성화되었습니다');
    }
  };

  // 알림 권한 상태 초기화
  useEffect(() => {
    const permission = getNotificationPermission();
    setNotificationsEnabled(permission === 'granted');
  }, []);

  const menuItems = [
    {
      icon: User,
      label: '프로필 수정',
      description: '이름 수정',
      action: () => setProfileModalOpen(true),
    },
    {
      icon: Target,
      label: '목표 관리',
      description: '재정 목표 수정',
      action: () => setGoalModalOpen(true),
    },
    {
      icon: CreditCard,
      label: '자산/부채 관리',
      description: '예금, 대출, 할부 관리',
      action: () => setAssetModalOpen(true),
    },
  ];

  const supportItems = [
    {
      icon: HelpCircle,
      label: '도움말',
      action: () => navigate('/help'),
    },
    {
      icon: Shield,
      label: '개인정보 처리방침',
      action: () => navigate('/privacy'),
    },
  ];

  // 프로필 정보
  const userName = profile?.name || user?.email?.split('@')[0] || '사용자';
  const userEmail = user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="pt-2">
          <h1 className="text-2xl font-bold">설정</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="p-4">
            {profileLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">{userName}</h2>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                  {profile?.monthly_income && (
                    <p className="text-xs text-muted-foreground">
                      월 수입: {(profile.monthly_income / 10000).toFixed(0)}만원
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings Menu */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardContent className="p-0">
            {/* Notifications */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">알림</p>
                  <p className="text-sm text-muted-foreground">푸시 알림 받기</p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardContent className="p-0">
            {supportItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="font-medium">{item.label}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
        </Button>

        {/* Version */}
        <p className="text-center text-sm text-muted-foreground">
          버전 1.0.0
        </p>
      </div>

      {/* Modals */}
      <ProfileEditModal open={profileModalOpen} onOpenChange={setProfileModalOpen} />
      <GoalManagementModal open={goalModalOpen} onOpenChange={setGoalModalOpen} />
      <AssetManagementModal open={assetModalOpen} onOpenChange={setAssetModalOpen} />
    </MainLayout>
  );
}
