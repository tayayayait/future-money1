# 미래 재정 시뮬레이터 - UI/UX 상세 명세서 (XML 형식)

> AI/LLM이 구조를 명확하게 파싱할 수 있도록 XML 형식으로 작성된 디자인 시스템 명세서입니다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DesignSystem version="1.0" created="2026-01-30" project="미래재정시뮬레이터">

  <!-- ============================================== -->
  <!-- 1. 디자인 철학 및 원칙 -->
  <!-- ============================================== -->
  <DesignPhilosophy>
    <CoreValues>
      <Value id="trust" priority="1">
        <Name>신뢰 (Trust)</Name>
        <Description>금융 데이터를 다루므로 안정감·전문성을 전달</Description>
      </Value>
      <Value id="clarity" priority="2">
        <Name>명확성 (Clarity)</Name>
        <Description>복잡한 시뮬레이션 결과를 직관적으로 표현</Description>
      </Value>
      <Value id="action" priority="3">
        <Name>행동 유도 (Action)</Name>
        <Description>단순 정보 제공이 아닌 실천 가능한 인사이트 제공</Description>
      </Value>
      <Value id="accessibility" priority="4">
        <Name>접근성 (Accessibility)</Name>
        <Description>모든 사용자가 쉽게 이용 가능한 UI</Description>
      </Value>
    </CoreValues>

    <ToneAndManner>
      <Style>Modern Fintech Minimal + Soft Glassmorphism</Style>
      <Mood>깔끔하고 신뢰감 있는, 동시에 친근한 느낌</Mood>
      <Keywords>
        <Keyword>투명성</Keyword>
        <Keyword>미래지향</Keyword>
        <Keyword>안정감</Keyword>
        <Keyword>실행력</Keyword>
      </Keywords>
    </ToneAndManner>
  </DesignPhilosophy>

  <!-- ============================================== -->
  <!-- 2. 색상 시스템 -->
  <!-- ============================================== -->
  <ColorSystem>
    <PrimaryColors name="Deep Blue" meaning="신뢰·안정">
      <Color token="primary-50" hex="#EEF2FF" />
      <Color token="primary-100" hex="#E0E7FF" />
      <Color token="primary-200" hex="#C7D2FE" />
      <Color token="primary-300" hex="#A5B4FC" />
      <Color token="primary-400" hex="#818CF8" />
      <Color token="primary-500" hex="#6366F1" isMain="true" />
      <Color token="primary-600" hex="#4F46E5" />
      <Color token="primary-700" hex="#4338CA" />
      <Color token="primary-800" hex="#3730A3" />
      <Color token="primary-900" hex="#312E81" />
    </PrimaryColors>

    <SecondaryColors name="Teal" meaning="성장·목표">
      <Color token="secondary-50" hex="#F0FDFA" />
      <Color token="secondary-100" hex="#CCFBF1" />
      <Color token="secondary-200" hex="#99F6E4" />
      <Color token="secondary-300" hex="#5EEAD4" />
      <Color token="secondary-400" hex="#2DD4BF" />
      <Color token="secondary-500" hex="#14B8A6" isMain="true" />
      <Color token="secondary-600" hex="#0D9488" />
      <Color token="secondary-700" hex="#0F766E" />
      <Color token="secondary-800" hex="#115E59" />
      <Color token="secondary-900" hex="#134E4A" />
    </SecondaryColors>

    <SemanticColors>
      <Color token="success" hex="#10B981" usage="목표 달성, 흑자" />
      <Color token="success-light" hex="#D1FAE5" usage="성공 배경" />
      <Color token="warning" hex="#F59E0B" usage="주의, 예산 근접" />
      <Color token="warning-light" hex="#FEF3C7" usage="경고 배경" />
      <Color token="danger" hex="#EF4444" usage="적자, 초과" />
      <Color token="danger-light" hex="#FEE2E2" usage="위험 배경" />
      <Color token="info" hex="#3B82F6" usage="정보, 팁" />
      <Color token="info-light" hex="#DBEAFE" usage="정보 배경" />
    </SemanticColors>

    <NeutralColors>
      <Color token="gray-50" hex="#F9FAFB" usage="배경" />
      <Color token="gray-100" hex="#F3F4F6" usage="카드 배경" />
      <Color token="gray-200" hex="#E5E7EB" usage="구분선" />
      <Color token="gray-300" hex="#D1D5DB" usage="비활성" />
      <Color token="gray-400" hex="#9CA3AF" usage="플레이스홀더" />
      <Color token="gray-500" hex="#6B7280" usage="보조 텍스트" />
      <Color token="gray-600" hex="#4B5563" usage="본문" />
      <Color token="gray-700" hex="#374151" usage="제목" />
      <Color token="gray-800" hex="#1F2937" usage="강조 제목" />
      <Color token="gray-900" hex="#111827" usage="최고 강조" />
    </NeutralColors>

    <ScenarioColors>
      <Color token="scenario-baseline" hex="#6B7280" label="현재 유지" />
      <Color token="scenario-a" hex="#6366F1" label="조정안 A" />
      <Color token="scenario-b" hex="#14B8A6" label="조정안 B" />
      <Color token="scenario-c" hex="#F59E0B" label="조정안 C" />
    </ScenarioColors>

    <DarkMode selector="[data-theme='dark']">
      <Color token="bg-primary" hex="#0F172A" />
      <Color token="bg-secondary" hex="#1E293B" />
      <Color token="bg-card" hex="#334155" />
      <Color token="text-primary" hex="#F1F5F9" />
      <Color token="text-secondary" hex="#94A3B8" />
      <Color token="border-color" hex="#475569" />
    </DarkMode>
  </ColorSystem>

  <!-- ============================================== -->
  <!-- 3. 타이포그래피 -->
  <!-- ============================================== -->
  <Typography>
    <FontFamilies>
      <Font token="font-primary" usage="한글 최적화">
        <Family>Pretendard</Family>
        <Fallback>-apple-system</Fallback>
        <Fallback>BlinkMacSystemFont</Fallback>
        <Fallback>sans-serif</Fallback>
      </Font>
      <Font token="font-display" usage="숫자/금액 강조">
        <Family>Outfit</Family>
        <Fallback>sans-serif</Fallback>
      </Font>
      <Font token="font-mono" usage="금액/수치 정렬">
        <Family>JetBrains Mono</Family>
        <Fallback>D2Coding</Fallback>
        <Fallback>monospace</Fallback>
      </Font>
    </FontFamilies>

    <TypeScale>
      <Style token="display-xl" size="36px" weight="700" lineHeight="1.2" usage="대시보드 메인 금액" />
      <Style token="display-lg" size="30px" weight="700" lineHeight="1.2" usage="섹션 주요 수치" />
      <Style token="heading-1" size="24px" weight="600" lineHeight="1.3" usage="페이지 타이틀" />
      <Style token="heading-2" size="20px" weight="600" lineHeight="1.3" usage="카드 타이틀" />
      <Style token="heading-3" size="18px" weight="600" lineHeight="1.4" usage="서브 섹션" />
      <Style token="body-lg" size="16px" weight="400" lineHeight="1.6" usage="본문 (기본)" isDefault="true" />
      <Style token="body-md" size="14px" weight="400" lineHeight="1.5" usage="보조 텍스트" />
      <Style token="body-sm" size="12px" weight="400" lineHeight="1.5" usage="캡션, 레이블" />
      <Style token="body-xs" size="11px" weight="500" lineHeight="1.4" usage="배지, 태그" />
    </TypeScale>

    <AmountFormatting>
      <Rule type="positive" className="amount-positive">
        <FontFamily>var(--font-display)</FontFamily>
        <Color>var(--success)</Color>
        <FontWeight>600</FontWeight>
        <Example>+1,234,567원</Example>
      </Rule>
      <Rule type="negative" className="amount-negative">
        <FontFamily>var(--font-display)</FontFamily>
        <Color>var(--danger)</Color>
        <FontWeight>600</FontWeight>
        <Example>-1,234,567원</Example>
      </Rule>
      <FormatSpec>
        <ThousandSeparator>,</ThousandSeparator>
        <CurrencySuffix>원</CurrencySuffix>
        <Alignment>right</Alignment>
      </FormatSpec>
    </AmountFormatting>
  </Typography>

  <!-- ============================================== -->
  <!-- 4. 간격 & 레이아웃 -->
  <!-- ============================================== -->
  <SpacingSystem baseUnit="8px">
    <Spacing token="space-0" value="0" />
    <Spacing token="space-1" value="4px" usage="아이콘 내부" />
    <Spacing token="space-2" value="8px" usage="인라인 요소 간격" />
    <Spacing token="space-3" value="12px" usage="작은 컴포넌트 패딩" />
    <Spacing token="space-4" value="16px" usage="기본 패딩" isDefault="true" />
    <Spacing token="space-5" value="20px" usage="카드 패딩" />
    <Spacing token="space-6" value="24px" usage="섹션 간격" />
    <Spacing token="space-8" value="32px" usage="컨테이너 패딩" />
    <Spacing token="space-10" value="40px" usage="대형 섹션" />
    <Spacing token="space-12" value="48px" usage="페이지 상단 여백" />
    <Spacing token="space-16" value="64px" usage="섹션 분리" />
  </SpacingSystem>

  <Breakpoints>
    <Breakpoint token="mobile" min="0" max="639px" target="스마트폰" />
    <Breakpoint token="tablet" min="640px" max="1023px" target="태블릿" />
    <Breakpoint token="desktop" min="1024px" max="1279px" target="소형 데스크톱" />
    <Breakpoint token="wide" min="1280px" max="∞" target="대형 데스크톱" />
  </Breakpoints>

  <GridSystem>
    <Grid name="dashboard" className="grid-dashboard">
      <Display>grid</Display>
      <Gap>var(--space-4)</Gap>
      <Columns>repeat(auto-fit, minmax(280px, 1fr))</Columns>
      <ResponsiveRules>
        <Rule breakpoint="mobile">1 column</Rule>
        <Rule breakpoint="tablet">2 columns</Rule>
        <Rule breakpoint="desktop">3-4 columns</Rule>
      </ResponsiveRules>
    </Grid>
  </GridSystem>

  <Container className="container">
    <MaxWidth>1280px</MaxWidth>
    <Margin>0 auto</Margin>
    <Padding breakpoint="mobile">0 var(--space-4)</Padding>
    <Padding breakpoint="tablet">0 var(--space-6)</Padding>
    <Padding breakpoint="desktop">0 var(--space-8)</Padding>
  </Container>

  <!-- ============================================== -->
  <!-- 5. 컴포넌트 규격 -->
  <!-- ============================================== -->
  <Components>

    <!-- 5.1 버튼 -->
    <Component name="Button">
      <Sizes>
        <Size token="xs" height="28px" paddingX="12px" paddingY="8px" fontSize="12px" />
        <Size token="sm" height="32px" paddingX="16px" paddingY="8px" fontSize="13px" />
        <Size token="md" height="40px" paddingX="20px" paddingY="10px" fontSize="14px" isDefault="true" />
        <Size token="lg" height="48px" paddingX="24px" paddingY="12px" fontSize="16px" />
        <Size token="xl" height="56px" paddingX="32px" paddingY="16px" fontSize="18px" />
      </Sizes>
      <Variants>
        <Variant name="primary" background="var(--primary-500)" textColor="white" />
        <Variant name="secondary" background="var(--secondary-500)" textColor="white" />
        <Variant name="outline" background="transparent" textColor="var(--primary-500)" border="1px solid var(--primary-500)" />
        <Variant name="ghost" background="transparent" textColor="var(--primary-500)" />
        <Variant name="danger" background="var(--danger)" textColor="white" />
      </Variants>
      <States>
        <State name="hover" effect="밝기 +10%" shadow="shadow-sm" />
        <State name="active" effect="밝기 -5%" />
        <State name="disabled" opacity="50%" cursor="not-allowed" />
        <State name="loading" showSpinner="true" clickable="false" />
      </States>
      <Style borderRadius="8px" transition="150ms ease" />
    </Component>

    <!-- 5.2 입력 필드 -->
    <Component name="Input">
      <BaseSpec>
        <Height>44px</Height>
        <Padding>12px 16px</Padding>
        <Border>1px solid var(--gray-300)</Border>
        <BorderRadius>8px</BorderRadius>
        <FontSize>16px</FontSize>
        <Note>16px 폰트로 모바일 줌 방지</Note>
      </BaseSpec>
      <States>
        <State name="default" border="var(--gray-300)" />
        <State name="focus" border="var(--primary-500)" ring="2px var(--primary-100)" />
        <State name="error" border="var(--danger)" background="var(--danger-light)" />
        <State name="disabled" background="var(--gray-100)" textColor="var(--gray-400)" />
      </States>
      <AmountInputSpec>
        <TextAlign>right</TextAlign>
        <AutoFormat>comma</AutoFormat>
        <Suffix>원</Suffix>
        <InputMode>numeric</InputMode>
      </AmountInputSpec>
    </Component>

    <!-- 5.3 카드 -->
    <Component name="Card">
      <BaseSpec>
        <Background light="white" dark="var(--gray-800)" />
        <BorderRadius>16px</BorderRadius>
        <Padding>20px</Padding>
        <BoxShadow>0 1px 3px rgba(0,0,0,0.1)</BoxShadow>
        <Border>1px solid var(--gray-200)</Border>
      </BaseSpec>
      <Variants>
        <Variant name="default" description="기본 스타일" />
        <Variant name="elevated" boxShadow="shadow-lg" />
        <Variant name="glass" background="rgba(255,255,255,0.8)" backdropFilter="blur(20px)" />
        <Variant name="outline" border="2px solid" boxShadow="none" />
        <Variant name="interactive">
          <HoverEffect>
            <BoxShadow>shadow-md</BoxShadow>
            <Transform>scale(1.01)</Transform>
          </HoverEffect>
        </Variant>
      </Variants>
      <ScenarioCard>
        <TopColorBar height="4px" />
        <Badge position="top-right" options="현재|추천" />
        <HighlightArea for="핵심 수치" />
        <ChangeIndicator format="↑↓ 화살표 + 퍼센트" />
      </ScenarioCard>
    </Component>

    <!-- 5.4 모달 -->
    <Component name="Modal">
      <Overlay>
        <Background>rgba(0,0,0,0.5)</Background>
        <BackdropFilter>blur(4px)</BackdropFilter>
      </Overlay>
      <Container>
        <MaxWidth default="480px" large="640px" />
        <Width>calc(100% - 32px)</Width>
        <MaxHeight>90vh</MaxHeight>
        <BorderRadius>20px</BorderRadius>
        <Padding>24px</Padding>
      </Container>
      <Structure>
        <Header>타이틀 + 닫기 버튼</Header>
        <Body scrollable="true" />
        <Footer optional="true">액션 버튼</Footer>
      </Structure>
      <Animation>
        <Enter effect="fade-in + slide-up" duration="200ms" />
        <Exit effect="fade-out + slide-down" duration="150ms" />
      </Animation>
    </Component>

    <!-- 5.5 바텀시트 (모바일) -->
    <Component name="BottomSheet" platform="mobile">
      <DragHandle width="40px" height="4px" position="center-top" />
      <Padding>20px</Padding>
      <BorderRadius>24px 24px 0 0</BorderRadius>
      <MaxHeight>85vh</MaxHeight>
      <Gestures>
        <Gesture action="swipe-down" result="close" />
        <Gesture action="snap-middle" value="50vh" />
        <Gesture action="snap-full" value="85vh" />
      </Gestures>
    </Component>

    <!-- 5.6 차트 -->
    <Component name="Charts">
      <Chart type="TimeSeries" usage="순자산 추이">
        <ChartType>Area Chart with gradient fill</ChartType>
        <Scenarios max="4">baseline + 최대 3개 조정안</Scenarios>
        <Colors>시나리오별 색상 적용</Colors>
        <Interaction>터치/호버 시 툴팁</Interaction>
        <PeriodTabs>
          <Tab>1년</Tab>
          <Tab>3년</Tab>
          <Tab>5년</Tab>
        </PeriodTabs>
      </Chart>
      <Chart type="Donut" usage="카테고리 비율">
        <CenterLabel>총액 표시</CenterLabel>
        <Legend position="bottom" orientation="horizontal" />
        <Interaction>세그먼트 터치 시 상세 표시</Interaction>
      </Chart>
      <Chart type="GroupedBar" usage="월별 수입/지출">
        <Groups>수입 vs 지출</Groups>
        <Interaction>막대 터치 시 상세 금액</Interaction>
      </Chart>
      <CommonSpec>
        <MinHeight>200px</MinHeight>
        <AxisLabel>body-sm</AxisLabel>
        <Tooltip style="card" shadow="shadow-lg" />
        <Animation type="draw" duration="500ms" trigger="enter" />
      </CommonSpec>
    </Component>

    <!-- 5.7 배지 & 태그 -->
    <Component name="Badge">
      <BaseSpec>
        <Height>22px</Height>
        <Padding>0 8px</Padding>
        <BorderRadius default="4px" pill="11px" />
        <Font token="body-xs" weight="500" />
      </BaseSpec>
      <Variants>
        <Variant name="success" background="var(--success-light)" textColor="var(--success)" />
        <Variant name="warning" background="var(--warning-light)" textColor="var(--warning)" />
        <Variant name="danger" background="var(--danger-light)" textColor="var(--danger)" />
        <Variant name="info" background="var(--info-light)" textColor="var(--info)" />
        <Variant name="neutral" background="var(--gray-100)" textColor="var(--gray-600)" />
      </Variants>
      <SpecialBadges>
        <Badge label="추천" background="primary-gradient" textColor="white" />
        <Badge label="프리미엄" background="amber-gradient" textColor="white" />
        <Badge label="NEW" background="var(--secondary)" textColor="white" />
      </SpecialBadges>
    </Component>

    <!-- 5.8 진행 표시 -->
    <Component name="Progress">
      <Linear usage="예산 소진율">
        <Height default="8px" emphasized="12px" />
        <BorderRadius>full</BorderRadius>
        <Background>var(--gray-200)</Background>
        <FillColors>
          <Range min="0" max="70" color="var(--success)" />
          <Range min="70" max="90" color="var(--warning)" />
          <Range min="90" max="100" color="var(--danger)" />
        </FillColors>
      </Linear>
      <Circular usage="목표 달성률">
        <Sizes>
          <Size token="sm" value="80px" />
          <Size token="md" value="120px" />
          <Size token="lg" value="160px" />
        </Sizes>
        <StrokeWidth>8px</StrokeWidth>
        <CenterText>퍼센트 숫자</CenterText>
      </Circular>
    </Component>

  </Components>

  <!-- ============================================== -->
  <!-- 6. 화면별 레이아웃 설계 -->
  <!-- ============================================== -->
  <Screens>

    <!-- 6.1 온보딩 -->
    <Screen name="Onboarding" type="flow">
      <Step order="1" name="Welcome">
        <Components>
          <Illustration position="center-top" />
          <Headline>현재 소비가 만드는 미래를 미리 확인하세요</Headline>
          <PageIndicator format="● ○ ○ ○" totalSteps="4" />
          <Button variant="primary" size="lg">시작하기</Button>
        </Components>
      </Step>
      <Step order="2" name="BasicInfo">
        <Header>
          <BackButton />
          <StepIndicator>1/4</StepIndicator>
        </Header>
        <Title>기본 정보를 알려주세요</Title>
        <Fields>
          <Field name="monthlyIncome" type="amount" label="월 실수령액" required="true" />
          <Field name="payDay" type="select" label="급여일" options="1-31" format="매월 N일" />
          <Field name="housingType" type="segmented" label="거주 형태">
            <Option>전세</Option>
            <Option>월세</Option>
            <Option>자가</Option>
            <Option>기타</Option>
          </Field>
        </Fields>
        <Button variant="primary" position="bottom">다음</Button>
      </Step>
      <Step order="3" name="Assets">
        <Title>자산/부채 정보 (선택)</Title>
        <Fields>
          <Field name="savings" type="amount" label="현금·예금" optional="true" />
          <Field name="loans" type="amount" label="대출 잔액" optional="true" />
          <Field name="installments" type="amount" label="카드 할부/리볼빙" optional="true" />
        </Fields>
      </Step>
      <Step order="4" name="Goals">
        <Title>목표 설정</Title>
        <Fields>
          <Field name="goalType" type="select" label="목표 유형" />
          <Field name="goalAmount" type="amount" label="목표 금액" />
          <Field name="targetDate" type="date" label="목표 달성일" />
        </Fields>
      </Step>
    </Screen>

    <!-- 6.2 메인 대시보드 -->
    <Screen name="Dashboard" type="main">
      <Header>
        <Logo position="left" />
        <Actions position="right">
          <IconButton icon="Bell" ariaLabel="알림" />
          <IconButton icon="Settings" ariaLabel="설정" />
        </Actions>
      </Header>

      <Content>
        <Greeting>안녕하세요, {userName}님</Greeting>

        <Card id="cashflow" variant="elevated">
          <Title>이번 달 현금흐름</Title>
          <MainAmount format="signed">+850,000원</MainAmount>
          <ProgressBar />
          <Summary>
            <Item label="수입">3,500,000</Item>
            <Item label="지출">2,650,000</Item>
          </Summary>
        </Card>

        <Grid columns="2" gap="space-4">
          <Card id="budget">
            <Title>예산 소진율</Title>
            <Progress type="linear" value="72" />
            <SubText>28% 여유</SubText>
          </Card>
          <Card id="goal">
            <Title>목표 달성률</Title>
            <Progress type="circular" value="45" />
            <SubText>비상금 1000만</SubText>
          </Card>
        </Grid>

        <Card id="insight" variant="interactive">
          <Icon name="Lightbulb" />
          <Title>이번 달 인사이트</Title>
          <Text>외식비가 평소보다 40% 높아요. 지금 패턴이면 목표 달성이 3개월 늦어져요.</Text>
          <Button variant="ghost">시뮬레이션 해보기 →</Button>
        </Card>

        <Section>
          <Header>
            <Title>최근 지출</Title>
            <Link>더보기 →</Link>
          </Header>
          <TransactionList limit="3">
            <Transaction category="외식" merchant="스타벅스" date="오늘" amount="-5,800원" />
            <Transaction category="교통" merchant="지하철" date="오늘" amount="-1,450원" />
            <Transaction category="쇼핑" merchant="쿠팡" date="어제" amount="-45,000원" />
          </TransactionList>
        </Section>
      </Content>

      <BottomNavigation>
        <NavItem icon="Home" label="홈" active="true" />
        <NavItem icon="List" label="내역" />
        <NavItem icon="PlusCircle" label="입력" isMain="true" />
        <NavItem icon="TrendingUp" label="시뮬" />
        <NavItem icon="MoreHorizontal" label="더보기" />
      </BottomNavigation>
    </Screen>

    <!-- 6.3 시뮬레이션 비교 화면 -->
    <Screen name="Simulation" type="core">
      <Header>
        <BackButton />
        <Title>미래 시뮬레이션</Title>
        <ShareButton />
      </Header>

      <PeriodSelector type="tabs">
        <Tab value="1">1년</Tab>
        <Tab value="3">3년</Tab>
        <Tab value="5" default="true">5년</Tab>
      </PeriodSelector>

      <Chart type="TimeSeries" height="280px">
        <Series id="baseline" label="현재유지" color="var(--scenario-baseline)" />
        <Series id="scenario-a" label="조정안A" color="var(--scenario-a)" />
        <Series id="scenario-b" label="조정안B" color="var(--scenario-b)" />
        <Annotation position="end" format="+N만원" />
      </Chart>

      <Section title="시나리오 비교">
        <HorizontalScroll>
          <ScenarioCard id="baseline" color="var(--scenario-baseline)">
            <Label>현재유지</Label>
            <Metrics>
              <Metric label="순자산" value="1.2억" />
              <Metric label="비상금" value="3개월분" />
              <Metric label="목표달성" value="2029.03" />
            </Metrics>
            <Button variant="outline" size="sm">상세보기</Button>
          </ScenarioCard>

          <ScenarioCard id="scenario-a" color="var(--scenario-a)" recommended="true">
            <Badge type="recommended">★ 추천</Badge>
            <Label>조정안A</Label>
            <Metrics>
              <Metric label="순자산" value="1.44억" change="+2400만" changeType="positive" />
              <Metric label="비상금" value="5개월분" />
              <Metric label="목표달성" value="2027.09" change="↑18개월" changeType="positive" />
            </Metrics>
            <Button variant="outline" size="sm">상세보기</Button>
          </ScenarioCard>

          <ScenarioCard id="scenario-b" color="var(--scenario-b)">
            <Label>조정안B</Label>
            <Metrics>
              <Metric label="순자산" value="1.38억" change="+1800만" changeType="positive" />
              <Metric label="비상금" value="4개월분" />
              <Metric label="목표달성" value="2028.01" change="↑12개월" changeType="positive" />
            </Metrics>
            <Button variant="outline" size="sm">상세보기</Button>
          </ScenarioCard>
        </HorizontalScroll>
      </Section>

      <Card id="scenario-detail">
        <Title>조정안 A 상세</Title>
        <Subtitle>가장 큰 영향을 주는 변화:</Subtitle>
        <ImpactList>
          <Impact rank="1" action="외식비 -20%" saving="+120만/년" />
          <Impact rank="2" action="구독 2개 해지" saving="+36만/년" />
        </ImpactList>
        <Assumptions>
          <Assumption label="물가상승" value="2%" />
          <Assumption label="투자수익" value="4%" />
        </Assumptions>
        <Button variant="primary" size="lg">이 시나리오로 시작하기</Button>
      </Card>

      <BottomNavigation />
    </Screen>

    <!-- 6.4 빠른 입력 화면 -->
    <Screen name="QuickInput" type="action">
      <Header>
        <BackButton />
        <Title>지출 입력</Title>
      </Header>

      <AmountDisplay size="display-xl">₩45,000</AmountDisplay>

      <CategorySelector>
        <Category icon="UtensilsCrossed" label="식비" color="#F97316" />
        <Category icon="Coffee" label="카페" color="#92400E" />
        <Category icon="Train" label="교통" color="#3B82F6" />
        <Category icon="ShoppingBag" label="쇼핑" color="#EC4899" />
        <Category icon="Home" label="주거" color="#8B5CF6" />
        <Category icon="Smartphone" label="통신" color="#14B8A6" />
        <Category icon="Film" label="여가" color="#F59E0B" />
        <Category icon="Heart" label="의료" color="#EF4444" />
        <Category icon="GraduationCap" label="교육" color="#6366F1" />
        <Category icon="PiggyBank" label="저축" color="#10B981" />
        <Category icon="CreditCard" label="금융" color="#6B7280" />
        <Category icon="MoreHorizontal" label="기타" color="#9CA3AF" />
      </CategorySelector>

      <Field name="memo" type="text" label="메모 (선택)" placeholder="점심 회식" />

      <Field name="date" type="date" defaultValue="today">
        <DisplayFormat>오늘 (2026.01.30)</DisplayFormat>
        <ChangeButton>변경</ChangeButton>
      </Field>

      <Checkbox name="isRecurring">
        <Label>고정비로 등록하기</Label>
        <Description>매월 반복되는 지출로 설정합니다</Description>
      </Checkbox>

      <Button variant="primary" size="lg" fullWidth="true">저장하기</Button>

      <NumericKeypad>
        <Row>
          <Key value="7" />
          <Key value="8" />
          <Key value="9" />
        </Row>
        <Row>
          <Key value="4" />
          <Key value="5" />
          <Key value="6" />
        </Row>
        <Row>
          <Key value="1" />
          <Key value="2" />
          <Key value="3" />
        </Row>
        <Row>
          <Key value="." />
          <Key value="0" />
          <Key value="backspace" icon="Delete" />
        </Row>
      </NumericKeypad>
    </Screen>

  </Screens>

  <!-- ============================================== -->
  <!-- 7. 인터랙션 & 애니메이션 -->
  <!-- ============================================== -->
  <Interactions>
    <Transitions>
      <Transition token="transition-fast" duration="150ms" easing="ease" />
      <Transition token="transition-normal" duration="200ms" easing="ease" isDefault="true" />
      <Transition token="transition-slow" duration="300ms" easing="ease" />
      <Transition token="transition-spring" duration="300ms" easing="cubic-bezier(0.34, 1.56, 0.64, 1)" />
      <Transition token="transition-bounce" duration="300ms" easing="cubic-bezier(0.68, -0.55, 0.27, 1.55)" />
    </Transitions>

    <MicroInteractions>
      <Interaction element="Button" trigger="hover">
        <Effect>밝기 증가</Effect>
        <Transform>scale(1.02)</Transform>
      </Interaction>
      <Interaction element="Card" trigger="hover">
        <Effect>shadow 증가</Effect>
        <Transform>translateY(-2px)</Transform>
      </Interaction>
      <Interaction element="Input" trigger="focus">
        <Effect>ring 확장</Effect>
        <BorderColor>var(--primary-500)</BorderColor>
      </Interaction>
      <Interaction element="Toggle" trigger="click">
        <Effect>핸들 슬라이드</Effect>
        <BackgroundChange>true</BackgroundChange>
      </Interaction>
      <Interaction element="Checkbox" trigger="click">
        <Effect>체크 아이콘 scale</Effect>
        <BackgroundFill>true</BackgroundFill>
      </Interaction>
      <Interaction element="ListItem" trigger="enter">
        <Effect>stagger fade-in</Effect>
        <Delay>50ms</Delay>
      </Interaction>
    </MicroInteractions>

    <PageTransitions>
      <Enter>
        <Opacity from="0" to="1" />
        <TranslateY from="20px" to="0" />
        <Duration>200ms</Duration>
      </Enter>
      <Exit>
        <Opacity from="1" to="0" />
        <TranslateY from="0" to="-10px" />
        <Duration>150ms</Duration>
      </Exit>
    </PageTransitions>

    <LoadingStates>
      <State context="page" pattern="skeleton" effect="shimmer" />
      <State context="button" pattern="spinner" disableClick="true" />
      <State context="chart" pattern="fade-in + draw" />
      <State context="simulation" pattern="progress-bar + step-text" />
    </LoadingStates>

    <Gestures platform="mobile">
      <Gesture action="pull-to-refresh" result="데이터 새로고침" />
      <Gesture action="swipe-left" context="list" result="삭제/수정 액션 노출" />
      <Gesture action="swipe-down" context="modal" result="모달 닫기" />
      <Gesture action="long-press" result="컨텍스트 메뉴 표시" />
      <Gesture action="pinch" context="chart" result="확대/축소" />
    </Gestures>
  </Interactions>

  <!-- ============================================== -->
  <!-- 8. 아이콘 시스템 -->
  <!-- ============================================== -->
  <IconSystem>
    <Library primary="Lucide Icons" fallback="Heroicons" />
    <Sizes>
      <Size token="xs" value="16px" />
      <Size token="sm" value="20px" />
      <Size token="md" value="24px" isDefault="true" />
      <Size token="lg" value="32px" />
      <Size token="xl" value="48px" />
    </Sizes>
    <Style stroke="2px" corners="rounded" color="currentColor" />

    <CategoryIcons>
      <Icon category="식비" name="UtensilsCrossed" color="#F97316" />
      <Icon category="카페" name="Coffee" color="#92400E" />
      <Icon category="교통" name="Train" color="#3B82F6" />
      <Icon category="쇼핑" name="ShoppingBag" color="#EC4899" />
      <Icon category="주거" name="Home" color="#8B5CF6" />
      <Icon category="통신" name="Smartphone" color="#14B8A6" />
      <Icon category="여가" name="Film" color="#F59E0B" />
      <Icon category="의료" name="Heart" color="#EF4444" />
      <Icon category="교육" name="GraduationCap" color="#6366F1" />
      <Icon category="저축" name="PiggyBank" color="#10B981" />
      <Icon category="금융" name="CreditCard" color="#6B7280" />
      <Icon category="기타" name="MoreHorizontal" color="#9CA3AF" />
    </CategoryIcons>

    <StatusIcons>
      <Icon status="success" name="CheckCircle" color="var(--success)" />
      <Icon status="warning" name="AlertTriangle" color="var(--warning)" />
      <Icon status="error" name="XCircle" color="var(--danger)" />
      <Icon status="info" name="Info" color="var(--info)" />
      <Icon status="trending-up" name="TrendingUp" color="var(--success)" />
      <Icon status="trending-down" name="TrendingDown" color="var(--danger)" />
      <Icon status="neutral" name="Minus" color="var(--gray-500)" />
    </StatusIcons>
  </IconSystem>

  <!-- ============================================== -->
  <!-- 9. 접근성 가이드라인 -->
  <!-- ============================================== -->
  <Accessibility>
    <ColorContrast>
      <Rule context="body-text" minRatio="4.5:1" />
      <Rule context="large-text" minRatio="3:1" minSize="18px" />
      <Rule context="ui-components" minRatio="3:1" />
    </ColorContrast>

    <TouchTargets>
      <MinSize>44x44px</MinSize>
      <MinSpacing>8px</MinSpacing>
    </TouchTargets>

    <KeyboardNavigation>
      <Rule>모든 인터랙티브 요소 탭 접근 가능</Rule>
      <Rule>포커스 링 명확히 표시 (ring 2px)</Rule>
      <Rule>논리적 탭 순서 유지</Rule>
    </KeyboardNavigation>

    <ScreenReader>
      <Rule>모든 이미지에 alt 텍스트</Rule>
      <Rule>아이콘 버튼에 aria-label</Rule>
      <Rule>동적 콘텐츠에 aria-live</Rule>
      <Rule context="amount">금액은 "삼백오십만 원" 형태로 읽히도록</Rule>
    </ScreenReader>

    <ReducedMotion>
      <MediaQuery>prefers-reduced-motion: reduce</MediaQuery>
      <Action>animation-duration: 0.01ms !important</Action>
      <Action>transition-duration: 0.01ms !important</Action>
    </ReducedMotion>
  </Accessibility>

  <!-- ============================================== -->
  <!-- 10. 다크모드 가이드 -->
  <!-- ============================================== -->
  <DarkModeGuide>
    <ColorMapping>
      <Map light="white" dark="gray-900" usage="배경" />
      <Map light="gray-50" dark="gray-800" usage="카드 배경" />
      <Map light="gray-100" dark="gray-700" usage="입력 배경" />
      <Map light="gray-200" dark="gray-600" usage="구분선" />
      <Map light="gray-900" dark="gray-50" usage="주요 텍스트" />
      <Map light="gray-600" dark="gray-300" usage="보조 텍스트" />
    </ColorMapping>

    <Implementation>
      <SystemDetection media="prefers-color-scheme: dark" />
      <ManualToggle>
        <Dark selector="[data-theme='dark']" />
        <Light selector="[data-theme='light']" />
      </ManualToggle>
    </Implementation>
  </DarkModeGuide>

  <!-- ============================================== -->
  <!-- 11. 오류 처리 UI -->
  <!-- ============================================== -->
  <ErrorHandling>
    <InlineError>
      <Position>입력 필드 바로 아래</Position>
      <Color>var(--danger)</Color>
      <Icon name="AlertCircle" size="16px" />
      <TextStyle>body-sm</TextStyle>
      <Example field="월 수입" error="0보다 큰 금액을 입력하세요" />
    </InlineError>

    <Toast>
      <Position>화면 하단 중앙 (Safe Area 고려)</Position>
      <Duration>3초 (자동 사라짐)</Duration>
      <Variants>
        <Variant type="success" background="green" icon="CheckCircle" />
        <Variant type="error" background="red" icon="XCircle" />
        <Variant type="info" background="blue" icon="Info" />
        <Variant type="warning" background="orange" icon="AlertTriangle" />
      </Variants>
    </Toast>

    <EmptyState>
      <Illustration />
      <Title>아직 입력된 내역이 없어요</Title>
      <Description>첫 지출을 입력하고 미래를 시뮬레이션해보세요</Description>
      <Button variant="primary">+ 지출 입력하기</Button>
    </EmptyState>
  </ErrorHandling>

  <!-- ============================================== -->
  <!-- 12. 수익화 UI 패턴 -->
  <!-- ============================================== -->
  <Monetization>
    <UpsellBanner>
      <Icon>✨</Icon>
      <Title>3개 이상의 시나리오 비교가 필요하신가요?</Title>
      <Description>프리미엄에서 무제한 시뮬레이션을 이용해보세요</Description>
      <Actions>
        <Button variant="primary">프리미엄 시작하기</Button>
        <Button variant="ghost">나중에</Button>
      </Actions>
    </UpsellBanner>

    <LockedFeature>
      <Preview blur="true" />
      <LockIcon>🔒</LockIcon>
      <Label>프리미엄 기능</Label>
      <Button variant="outline">잠금 해제하기</Button>
    </LockedFeature>

    <PricingCards>
      <Plan name="무료">
        <Price>₩0/월</Price>
        <Features>
          <Feature included="true">기본 입력/분류</Feature>
          <Feature included="true">월간 요약</Feature>
          <Feature included="true">1개 시나리오</Feature>
        </Features>
        <Button variant="outline" disabled="true">현재 플랜</Button>
      </Plan>
      <Plan name="프리미엄" recommended="true">
        <Badge>★ 추천</Badge>
        <Price>₩4,900/월</Price>
        <Features>
          <Feature included="true">무료 기능 전체</Feature>
          <Feature included="true">무제한 시뮬</Feature>
          <Feature included="true">목표 최적화</Feature>
          <Feature included="true">PDF 리포트</Feature>
        </Features>
        <Button variant="primary">시작하기</Button>
      </Plan>
    </PricingCards>
  </Monetization>

  <!-- ============================================== -->
  <!-- 13. 개발 구현 가이드 -->
  <!-- ============================================== -->
  <DevelopmentGuide>
    <CSSVariables>
      <Category name="Radius">
        <Variable token="radius-sm" value="4px" />
        <Variable token="radius-md" value="8px" />
        <Variable token="radius-lg" value="12px" />
        <Variable token="radius-xl" value="16px" />
        <Variable token="radius-2xl" value="20px" />
        <Variable token="radius-full" value="9999px" />
      </Category>
      <Category name="Shadow">
        <Variable token="shadow-xs" value="0 1px 2px rgba(0,0,0,0.05)" />
        <Variable token="shadow-sm" value="0 1px 3px rgba(0,0,0,0.1)" />
        <Variable token="shadow-md" value="0 4px 6px rgba(0,0,0,0.1)" />
        <Variable token="shadow-lg" value="0 10px 15px rgba(0,0,0,0.1)" />
        <Variable token="shadow-xl" value="0 20px 25px rgba(0,0,0,0.1)" />
      </Category>
      <Category name="Z-Index">
        <Variable token="z-dropdown" value="10" />
        <Variable token="z-sticky" value="20" />
        <Variable token="z-fixed" value="30" />
        <Variable token="z-modal-backdrop" value="40" />
        <Variable token="z-modal" value="50" />
        <Variable token="z-toast" value="60" />
      </Category>
    </CSSVariables>

    <NamingConventions>
      <Components case="PascalCase">
        <Example>Button, Card, Modal, Input</Example>
        <Example>SimulationChart, ScenarioCard</Example>
        <Example>TransactionList, CategoryBadge</Example>
      </Components>
      <Props>
        <Prop name="variant" type="enum" values="primary|secondary|outline" />
        <Prop name="size" type="enum" values="xs|sm|md|lg|xl" />
        <Prop name="isDisabled" type="boolean" />
        <Prop name="isLoading" type="boolean" />
        <Prop name="isActive" type="boolean" />
      </Props>
    </NamingConventions>

    <FileStructure>
      <Directory name="src">
        <Directory name="components">
          <Directory name="ui" description="기본 컴포넌트">
            <Directory name="Button" />
            <Directory name="Card" />
            <Directory name="Input" />
            <Directory name="Modal" />
          </Directory>
          <Directory name="charts" description="차트 컴포넌트" />
          <Directory name="simulation" description="시뮬레이션 관련" />
          <Directory name="layout" description="레이아웃" />
        </Directory>
        <Directory name="styles">
          <File>variables.css</File>
          <File>reset.css</File>
          <File>typography.css</File>
          <File>utilities.css</File>
        </Directory>
        <Directory name="assets">
          <Directory name="icons" />
          <Directory name="illustrations" />
        </Directory>
      </Directory>
    </FileStructure>
  </DevelopmentGuide>

  <!-- ============================================== -->
  <!-- 14. 체크리스트 -->
  <!-- ============================================== -->
  <QAChecklists>
    <Checklist category="Design">
      <Item>모든 색상이 정의된 변수 사용</Item>
      <Item>타이포그래피 스케일 준수</Item>
      <Item>8px 간격 그리드 준수</Item>
      <Item>터치 타겟 44px 이상</Item>
      <Item>다크모드 지원</Item>
      <Item>반응형 레이아웃 테스트</Item>
    </Checklist>

    <Checklist category="Accessibility">
      <Item>색상 대비 4.5:1 이상</Item>
      <Item>키보드 접근 가능</Item>
      <Item>포커스 표시 가시적</Item>
      <Item>스크린리더 테스트</Item>
      <Item>모션 감소 설정 존중</Item>
    </Checklist>

    <Checklist category="Performance">
      <Item>이미지 최적화 (WebP)</Item>
      <Item>레이지 로딩 적용</Item>
      <Item>애니메이션 60fps 유지</Item>
      <Item>차트 렌더링 최적화</Item>
    </Checklist>
  </QAChecklists>

</DesignSystem>
```
