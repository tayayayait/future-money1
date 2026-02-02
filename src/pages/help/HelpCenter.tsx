import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, HelpCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const FAQ_DATA = [
  {
    category: '시작하기',
    questions: [
      {
        q: '미래 재정 시뮬레이터는 어떤 서비스인가요?',
        a: '현재의 소비 패턴과 저축 습관을 바탕으로 미래의 재정 상태를 시뮬레이션하여 보여주는 서비스입니다. 다양한 시나리오를 비교하여 최적의 재정 계획을 세울 수 있도록 도와드립니다.',
      },
      {
        q: '회원가입 없이 사용할 수 있나요?',
        a: '서비스 이용을 위해서는 회원가입이 필요합니다. 가입 후 개인화된 재정 데이터를 안전하게 저장하고 관리할 수 있습니다.',
      },
    ],
  },
  {
    category: '지출 입력',
    questions: [
      {
        q: '지출을 어떻게 입력하나요?',
        a: '하단 네비게이션 바의 "+" 버튼을 눌러 빠른 입력 화면으로 이동합니다. 금액, 카테고리, 메모를 입력하고 저장하면 됩니다. 고정비의 경우 "고정비로 등록하기" 옵션을 선택하면 매월 자동으로 반영됩니다.',
      },
      {
        q: '카테고리는 어떻게 설정하나요?',
        a: '식비, 카페, 교통, 쇼핑, 주거, 통신, 여가, 의료, 교육, 저축, 금융, 기타 총 12개의 카테고리가 제공됩니다. 지출 입력 시 해당하는 카테고리를 선택하면 됩니다.',
      },
      {
        q: '과거 지출 내역을 수정할 수 있나요?',
        a: '네, 내역 페이지에서 수정하고 싶은 항목을 클릭하면 수정 및 삭제가 가능합니다.',
      },
    ],
  },
  {
    category: '시뮬레이션',
    questions: [
      {
        q: '시뮬레이션은 어떻게 동작하나요?',
        a: '현재의 수입, 지출, 저축 패턴을 기반으로 1년, 3년, 5년 후의 순자산을 예측합니다. 여러 시나리오를 만들어 지출 패턴 변화에 따른 미래 재정 상태를 비교할 수 있습니다.',
      },
      {
        q: '시나리오는 어떻게 만드나요?',
        a: '시뮬레이션 페이지에서 "새 시나리오 추가" 버튼을 클릭하고, 특정 카테고리의 지출을 늘리거나 줄이는 조정을 설정합니다. 예를 들어 "외식비 -20%" 같은 변화를 설정하면 자동으로 미래 예측값이 계산됩니다.',
      },
      {
        q: '추천 시나리오는 어떻게 선택되나요?',
        a: '목표 달성 속도, 비상금 마련 기간, 전체 순자산 증가율 등을 종합적으로 고려하여 가장 효율적인 시나리오를 추천해드립니다.',
      },
    ],
  },
  {
    category: '목표 관리',
    questions: [
      {
        q: '재정 목표는 어떻게 설정하나요?',
        a: '설정 페이지의 "목표 관리"에서 목표 유형(비상금, 주택구매 등), 목표 금액, 달성 희망일을 설정할 수 있습니다. 여러 개의 목표를 동시에 관리할 수 있습니다.',
      },
      {
        q: '목표 진행률은 어떻게 계산되나요?',
        a: '(현재 금액 / 목표 금액) × 100으로 계산됩니다. 대시보드와 목표 관리 페이지에서 언제든지 진행 상황을 확인할 수 있습니다.',
      },
    ],
  },
  {
    category: '데이터 보안',
    questions: [
      {
        q: '내 재정 데이터는 안전한가요?',
        a: '모든 데이터는 Supabase를 통해 암호화되어 저장되며, Row Level Security(RLS) 정책으로 본인만 접근할 수 있습니다. 제3자와 데이터를 공유하지 않습니다.',
      },
      {
        q: '데이터를 백업하거나 내보낼 수 있나요?',
        a: '현재는 서비스 내에서만 데이터를 관리할 수 있습니다. 향후 CSV/Excel 내보내기 기능을 추가할 예정입니다.',
      },
    ],
  },
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQ = FAQ_DATA.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

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
            <h1 className="text-2xl font-bold">도움말</h1>
            <p className="text-sm text-muted-foreground">자주 묻는 질문과 사용 가이드</p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="궁금한 내용을 검색하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        {filteredFAQ.length > 0 ? (
          filteredFAQ.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex gap-2 items-start">
                          <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{item.q}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pl-7">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>검색 결과가 없습니다</p>
              <p className="text-sm">다른 키워드로 검색해보세요</p>
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">추가 문의</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              찾으시는 답변이 없으신가요? 언제든지 문의해주세요.
            </p>
            <Button variant="outline" className="w-full gap-2">
              <Mail className="h-4 w-4" />
              support@futurefinance.com
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
