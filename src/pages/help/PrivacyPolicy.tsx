import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              개인정보 처리방침
            </h1>
            <p className="text-sm text-muted-foreground">최종 수정일: 2026년 1월 30일</p>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-6 space-y-6 prose prose-sm dark:prose-invert max-w-none">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. 개인정보의 수집 및 이용 목적</h2>
              <p className="text-muted-foreground">
                미래 재정 시뮬레이터("회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>회원 가입 및 관리: 회원 가입 의사 확인, 회원제 서비스 제공</li>
                <li>재정 관리 서비스 제공: 수입/지출 데이터 관리, 미래 재정 시뮬레이션 제공</li>
                <li>서비스 개선: 서비스 이용 통계 분석, 신규 서비스 개발</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. 수집하는 개인정보 항목</h2>
              <p className="text-muted-foreground mb-2">회사는 다음의 개인정보 항목을 수집합니다:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li><strong>필수 항목:</strong> 이메일 주소, 비밀번호</li>
                <li><strong>선택 항목:</strong> 이름, 월 수입, 급여일, 거주형태</li>
                <li><strong>서비스 이용 과정에서 자동 수집:</strong> IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. 개인정보의 보유 및 이용 기간</h2>
              <p className="text-muted-foreground">
                회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)</li>
                <li>전자상거래법에 따른 보존 의무: 계약 또는 청약철회 등에 관한 기록 (5년)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. 개인정보의 제3자 제공</h2>
              <p className="text-muted-foreground">
                회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>현재 회사는 정보주체의 개인정보를 제3자에게 제공하고 있지 않습니다.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. 개인정보의 파기</h2>
              <p className="text-muted-foreground">
                회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>파기 절차:</strong> 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. 정보주체의 권리·의무 및 행사방법</h2>
              <p className="text-muted-foreground">
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                위 권리 행사는 서비스 내 설정 페이지 또는 이메일(support@futurefinance.com)을 통해 할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. 개인정보의 안전성 확보 조치</h2>
              <p className="text-muted-foreground">
                회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육</li>
                <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 암호화</li>
                <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">8. 개인정보 보호책임자</h2>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>성명:</strong> 개인정보 보호담당자<br />
                  <strong>이메일:</strong> support@futurefinance.com<br />
                  <strong>전화:</strong> (추후 공지)
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">9. 개인정보 처리방침 변경</h2>
              <p className="text-muted-foreground">
                이 개인정보 처리방침은 2026년 1월 30일부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
