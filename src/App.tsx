import { useState, useEffect } from 'react'
import {
  Camera,
  DollarSign,
  FileText,
  Search,
  BarChart3,
  CheckCircle,
  Clipboard,
  Home,
  Calendar,
  Handshake,
  Building,
  PartyPopper,
  Heart,
  Target,
  Key,
  Trophy,
  MessageCircle,
  Coins,
  TrendingUp,
  Wrench,
  Zap,
  Menu,
  X,
  Copy,
  Info,
  Printer,
  Download,
  ChevronDown,
  ArrowUp,
  ListChecks,
  Calculator,
  Receipt,
  HelpCircle,
  BookOpen,
  Mail,
  MapPin,
  Award,
  Star,
  User,
  Briefcase,
  Users,
  Clock,
  Shield,
  Lightbulb,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  HeartHandshake
} from 'lucide-react'
import jsPDF from 'jspdf'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    timeline: '',
    locations: '',
    creditScore: '',
    married: '',
    downPaymentSaved: '',
    assistanceNeeded: '',
    totalIncome: ''
  })
  const [isScrolled, setIsScrolled] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [activeChapter, setActiveChapter] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [calculatorData, setCalculatorData] = useState({
    homePrice: '',
    downPaymentPercent: '',
    interestRate: 6.26, // Default: Latest Freddie Mac PMMS 30-year rate (6.26%)
    loanTerm: 30
  })
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [rateLastUpdated, setRateLastUpdated] = useState(null)
  const ADMIN_FEE = 495

  // Closing Cost Calculator State
  const [closingCostData, setClosingCostData] = useState({
    homePrice: '',
    downPaymentPercent: '',
    state: 'TX', // Texas for state-specific calculations
    county: '', // County/City for accurate tax rate
    loanType: 'conventional', // conventional, FHA, VA
    propertyType: 'single-family', // single-family, townhome, condo
    includePrepaids: true,
    propertyTaxRate: 2.10, // Annual property tax rate (Texas default)
    homeInsurance: 1500, // Annual home insurance estimate (defaults to single-family)
    hoaFee: 0, // Monthly HOA/Condo fee
    sellerPaysClosing: false, // Whether seller is paying some closing costs
    sellerContribution: 0
  })

  // Property type insurance defaults (DFW typical ranges)
  const propertyInsuranceDefaults = {
    'single-family': 1500, // $1,200-$2,000/year
    'townhome': 1000, // $800-$1,400/year
    'condo': 500 // $300-$700/year (much cheaper, HOA master policy covers building)
  }

  // State default tax rates
  // NOTE: These rates should be verified annually with official county websites
  // See PROPERTY_TAX_RATES_SOURCES.md for sources and verification links
  // Rates are expressed as percentage (e.g., 2.10 = 2.10% of assessed value)
  const stateDefaultTaxRates = {
    'TX': 2.10 // Texas average (verify with official sources)
  }

  // County-specific tax rates
  // NOTE: These are estimates based on typical rates. Actual rates may vary.
  // Property tax rates are typically set annually and can change.
  // See PROPERTY_TAX_RATES_SOURCES.md for verification sources for each county.
  // Texas property tax rates are generally higher than national average.
  const countyTaxRates = {
    'TX': {
      // Dallas & Surrounding Areas
      'Dallas': 2.20,
      'Irving': 2.15,
      'Garland': 2.18,
      'Richardson': 2.12,
      'Grand Prairie': 2.25,
      'Arlington': 2.30,
      'Fort Worth': 2.22,
      'Desoto': 2.28,
      'Duncanville': 2.20,
      'Lancaster': 2.25,
      'Cedar Hill': 2.18,
      'Dallas County (Other)': 2.20,
      // Frisco, Plano & North Dallas
      'Frisco': 2.05,
      'Plano': 2.08,
      'McKinney': 2.10,
      'Allen': 2.12,
      'Addison': 2.15,
      'Carrollton': 2.18,
      'Lewisville': 2.20,
      'Collin County (Other)': 2.08,
      // Celina, Prosper & More
      'Celina': 2.00,
      'Prosper': 2.05,
      'Aubrey': 2.08,
      'Forney': 2.15,
      'Midlothian': 2.22,
      'North Richland Hills': 2.25,
      'Other DFW Communities': 2.10 // Texas default
    }
  }

  const [closingCostBreakdown, setClosingCostBreakdown] = useState({
    loanOrigination: 0,
    appraisal: 0,
    inspection: 0,
    titleInsurance: 0,
    recordingFees: 0,
    transferTax: 0,
    propertyTax: 0,
    homeInsurance: 0,
    prepaidInterest: 0,
    hoaPrepaid: 0,
    adminFee: 495,
    totalClosingCosts: 0,
    totalCashNeeded: 0
  })

  // Fetch current mortgage rate from Freddie Mac Primary Mortgage Market Survey (PMMS)
  // Freddie Mac publishes weekly rates every Thursday
  // Note: Freddie Mac doesn't provide a public API, so we use their published rates
  // Current rates as of latest PMMS: 30-Year Fixed: 6.26%, 15-Year Fixed: 5.54%
  useEffect(() => {
    const fetchCurrentRate = async () => {
      try {
        // Freddie Mac PMMS rates (updated weekly on Thursdays)
        // Since there's no public API, we use the latest published rate
        // For 30-year fixed mortgage (default loan term)
        const freddieMac30YearRate = 6.26 // Latest PMMS rate for 30-year fixed
        const freddieMac15YearRate = 5.54 // Latest PMMS rate for 15-year fixed

        // Set rate based on selected loan term, default to 30-year
        let defaultRate = freddieMac30YearRate
        if (calculatorData.loanTerm === 15) {
          defaultRate = freddieMac15YearRate
        } else if (calculatorData.loanTerm === 20) {
          // 20-year rates are typically between 15 and 30-year rates
          defaultRate = (freddieMac15YearRate + freddieMac30YearRate) / 2
        }

        if (!calculatorData.interestRate || calculatorData.interestRate === 0) {
          setCalculatorData(prev => ({
            ...prev,
            interestRate: defaultRate
          }))
          setRateLastUpdated(new Date())
        } else {
          // If rate is already set, just update the timestamp
          setRateLastUpdated(new Date())
        }
      } catch (error) {
        // Fallback to latest known Freddie Mac rate
        if (!calculatorData.interestRate || calculatorData.interestRate === 0) {
          setCalculatorData(prev => ({
            ...prev,
            interestRate: 6.26 // Latest Freddie Mac 30-year rate
          }))
        }
        setRateLastUpdated(new Date())
      }
    }

    fetchCurrentRate()
  }, [calculatorData.loanTerm])

  // Calculate mortgage payment
  useEffect(() => {
    const homePrice = parseFloat((calculatorData.homePrice?.toString() || '0').replace(/,/g, '')) || 0
    const downPaymentPercent = parseFloat(calculatorData.downPaymentPercent || 0) || 0
    const interestRate = parseFloat(calculatorData.interestRate || 0) || 0

    const downPaymentAmount = (homePrice * downPaymentPercent) / 100
    const principal = homePrice - downPaymentAmount
    const monthlyRate = (interestRate / 100) / 12
    const numberOfPayments = calculatorData.loanTerm * 12

    if (principal > 0 && monthlyRate > 0 && numberOfPayments > 0) {
      const payment = principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

      setMonthlyPayment(payment)
      setTotalPayment(payment * numberOfPayments)
      setTotalInterest((payment * numberOfPayments) - principal)
    } else {
      setMonthlyPayment(0)
      setTotalPayment(0)
      setTotalInterest(0)
    }
  }, [calculatorData])

  // Sync closing cost calculator with mortgage calculator when home price or down payment changes
  useEffect(() => {
    const mortgageHomePrice = parseFloat((calculatorData.homePrice?.toString() || '0').replace(/,/g, '')) || 0
    const mortgageDownPayment = parseFloat(calculatorData.downPaymentPercent || 0) || 0

    if (mortgageHomePrice > 0 && (!closingCostData.homePrice || closingCostData.homePrice === '')) {
      setClosingCostData(prev => ({
        ...prev,
        homePrice: calculatorData.homePrice,
        downPaymentPercent: mortgageDownPayment || prev.downPaymentPercent
      }))
    }
  }, [calculatorData.homePrice, calculatorData.downPaymentPercent])

  // Calculate closing costs
  useEffect(() => {
    const calculateClosingCosts = () => {
      const homePrice = parseFloat((closingCostData.homePrice?.toString() || '0').replace(/,/g, '')) || 0
      const downPaymentPercent = parseFloat(closingCostData.downPaymentPercent || 0) || 0
      const downPayment = (homePrice * downPaymentPercent) / 100
      const loanAmount = homePrice - downPayment

      if (homePrice === 0) {
        setClosingCostBreakdown({
          loanOrigination: 0,
          appraisal: 0,
          inspection: 0,
          titleInsurance: 0,
          recordingFees: 0,
          transferTax: 0,
          propertyTax: 0,
          homeInsurance: 0,
          prepaidInterest: 0,
          hoaPrepaid: 0,
          adminFee: 495,
          totalClosingCosts: 0,
          totalCashNeeded: 0
        })
        return
      }

      // Loan Origination Fee (typically 0.5-1% of loan amount)
      const loanOrigination = loanAmount * 0.01 // 1% estimate

      // Appraisal (DFW: $400-$600+, varies by property size)
      const appraisal = homePrice > 750000 ? 600 : 450

      // Home Inspection (DFW: $350-$750)
      const inspection = 550 // Average

      // Title Insurance (varies by state and loan amount)
      // Texas: ~0.5-0.7% of loan amount
      let titleInsuranceRate = 0.006 // Texas average
      const titleInsurance = loanAmount * titleInsuranceRate

      // Recording Fees (varies by state)
      // Texas: typically $50-200 depending on county
      let recordingFees = 150 // Texas average

      // Transfer Tax (varies significantly by state/county)
      // Texas: Generally no state transfer tax, but some local jurisdictions may have small fees
      // Most Texas counties/cities do not charge transfer tax to buyers
      let transferTax = 0 // Texas typically has no transfer tax for buyers

      // Property Tax Proration (estimate 1-2 months)
      const monthlyPropertyTax = (homePrice * closingCostData.propertyTaxRate / 100) / 12
      const propertyTax = monthlyPropertyTax * 2 // 2 months prepaid

      // Home Insurance (annual, prorated for 1 year)
      const homeInsurance = closingCostData.includePrepaids ? closingCostData.homeInsurance : 0

      // Prepaid Interest (estimate 15 days) - use rate from mortgage calculator
      const interestRate = calculatorData.interestRate || 6.26
      const dailyInterest = (loanAmount * (interestRate / 100)) / 365
      const prepaidInterest = closingCostData.includePrepaids ? dailyInterest * 15 : 0

      // HOA/Condo Fee Prepaid (1 month in advance)
      const hoaPrepaid = closingCostData.includePrepaids && closingCostData.hoaFee > 0 ? closingCostData.hoaFee : 0

      // Admin Fee
      const adminFee = 495

      // Total Closing Costs
      let totalClosingCosts = loanOrigination + appraisal + inspection + titleInsurance +
        recordingFees + transferTax + propertyTax + homeInsurance +
        prepaidInterest + hoaPrepaid + adminFee

      // Subtract seller contribution if applicable
      if (closingCostData.sellerPaysClosing) {
        totalClosingCosts = Math.max(0, totalClosingCosts - closingCostData.sellerContribution)
      }

      // Total Cash Needed = Down Payment + Closing Costs
      const totalCashNeeded = downPayment + totalClosingCosts

      setClosingCostBreakdown({
        loanOrigination,
        appraisal,
        inspection,
        titleInsurance,
        recordingFees,
        transferTax,
        propertyTax,
        homeInsurance,
        prepaidInterest,
        hoaPrepaid,
        adminFee,
        totalClosingCosts,
        totalCashNeeded
      })
    }

    calculateClosingCosts()
  }, [closingCostData, calculatorData.interestRate])

  // Set initial tax rate based on default state on component mount
  useEffect(() => {
    if (!closingCostData.county && closingCostData.state) {
      const defaultRate = stateDefaultTaxRates[closingCostData.state]
      if (defaultRate && closingCostData.propertyTaxRate !== defaultRate) {
        setClosingCostData(prev => ({
          ...prev,
          propertyTaxRate: defaultRate
        }))
      }
    }
  }, []) // Run once on mount

  const handleCalculatorChange = (e) => {
    const { name, value } = e.target
    if (name === 'homePrice') {
      // Remove commas and format with commas
      const numericValue = value.replace(/,/g, '')
      if (numericValue === '' || /^\d+$/.test(numericValue)) {
        const formattedValue = numericValue === '' ? '' : parseInt(numericValue).toLocaleString('en-US')
        setCalculatorData(prev => ({
          ...prev,
          [name]: formattedValue
        }))
      }
    } else if (name === 'loanTerm') {
      // Update interest rate based on loan term (Freddie Mac rates)
      const term = parseInt(value)
      const freddieMac30YearRate = 6.26
      const freddieMac15YearRate = 5.54

      let newRate = freddieMac30YearRate
      if (term === 15) {
        newRate = freddieMac15YearRate
      } else if (term === 20) {
        newRate = (freddieMac15YearRate + freddieMac30YearRate) / 2
      }

      setCalculatorData(prev => ({
        ...prev,
        [name]: term,
        interestRate: newRate
      }))
    } else {
      setCalculatorData(prev => ({
        ...prev,
        [name]: parseFloat(value) || (value === '' ? '' : 0)
      }))
    }
  }

  const handleClosingCostChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'homePrice') {
      const numericValue = value.replace(/,/g, '')
      if (numericValue === '' || /^\d+$/.test(numericValue)) {
        const formattedValue = numericValue === '' ? '' : parseInt(numericValue).toLocaleString('en-US')
        setClosingCostData(prev => ({ ...prev, [name]: formattedValue }))
      }
    } else if (name === 'propertyType') {
      // Update property type and auto-update home insurance to default for that type
      const newPropertyType = value
      const defaultInsurance = propertyInsuranceDefaults[newPropertyType]
      setClosingCostData(prev => ({
        ...prev,
        propertyType: newPropertyType,
        homeInsurance: defaultInsurance
      }))
    } else if (name === 'state') {
      // When state changes, reset county and update tax rate to state default
      const newState = value
      const stateDefaultRate = stateDefaultTaxRates[newState]
      setClosingCostData(prev => ({
        ...prev,
        state: newState,
        county: '', // Reset county when state changes
        propertyTaxRate: stateDefaultRate
      }))
    } else if (name === 'county') {
      // When county changes, update tax rate to county-specific rate
      const selectedCounty = value
      const state = closingCostData.state
      const countyRate = countyTaxRates[state]?.[selectedCounty] || stateDefaultTaxRates[state]
      setClosingCostData(prev => ({
        ...prev,
        county: selectedCounty,
        propertyTaxRate: countyRate
      }))
    } else if (name === 'loanType') {
      // Handle loanType dropdown
      setClosingCostData(prev => ({
        ...prev,
        loanType: value
      }))
    } else if (type === 'checkbox') {
      setClosingCostData(prev => ({ ...prev, [name]: checked }))
    } else {
      setClosingCostData(prev => ({
        ...prev,
        [name]: parseFloat(value) || (value === '' ? '' : 0)
      }))
    }
  }

  const copyFromMortgageCalculator = () => {
    const mortgageHomePrice = calculatorData.homePrice
    const mortgageDownPayment = calculatorData.downPaymentPercent

    if (mortgageHomePrice && mortgageDownPayment) {
      setClosingCostData(prev => ({
        ...prev,
        homePrice: mortgageHomePrice,
        downPaymentPercent: mortgageDownPayment
      }))
    }
  }

  const printClosingCosts = () => {
    window.print()
  }

  const exportClosingCosts = () => {
    const homePrice = parseFloat((closingCostData.homePrice?.toString() || '0').replace(/,/g, '')) || 0
    const downPaymentPercent = parseFloat(closingCostData.downPaymentPercent || 0) || 0

    // Create PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin

    // Colors matching website
    const accentColor = [212, 175, 55] // #D4AF37
    const darkColor = [45, 55, 72] // #2d3748
    const grayColor = [113, 128, 150] // #718096
    const lightGrayColor = [247, 250, 252] // #f7fafc

    // Helper function to add text with styling
    const addText = (text, x, y, options = {}) => {
      const {
        fontSize = 12,
        fontStyle = 'normal',
        color = darkColor,
        align = 'left'
      } = options
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', fontStyle)
      doc.setTextColor(color[0], color[1], color[2])
      doc.text(text, x, y, { align })
    }

    // Helper function to draw a line
    const drawLine = (x1, y1, x2, y2, color = accentColor, width = 0.5) => {
      doc.setDrawColor(color[0], color[1], color[2])
      doc.setLineWidth(width)
      doc.line(x1, y1, x2, y2)
    }

    // Header with accent bar
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
    doc.rect(margin, yPosition, contentWidth, 6, 'F')
    yPosition += 12 // Space after gold bar

    // Title with proper spacing
    addText('CLOSING COST ESTIMATE', pageWidth / 2, yPosition, {
      fontSize: 20,
      fontStyle: 'bold',
      color: accentColor,
      align: 'center'
    })
    yPosition += 12 // More space after title

    // Subtitle
    addText('Samantha Martinez | Realtor®', pageWidth / 2, yPosition, {
      fontSize: 12,
      color: grayColor,
      align: 'center'
    })
    yPosition += 18 // Space before next section

    // Property Information Section
    drawLine(margin, yPosition, pageWidth - margin, yPosition, accentColor, 1)
    yPosition += 8

    addText('Property Information', margin, yPosition, {
      fontSize: 14,
      fontStyle: 'bold',
      color: darkColor
    })
    yPosition += 8

    const propertyInfo = [
      ['Home Price', formatCurrency(homePrice)],
      ['Down Payment', `${formatCurrency((homePrice * downPaymentPercent) / 100)} (${downPaymentPercent}%)`],
      ['State', closingCostData.state],
      ['Loan Type', closingCostData.loanType],
      ['Property Type', closingCostData.propertyType === 'single-family' ? 'Single Family Home' : closingCostData.propertyType === 'townhome' ? 'Townhome' : 'Condo']
    ]

    propertyInfo.forEach(([label, value]) => {
      addText(label + ':', margin, yPosition, { fontSize: 10, color: grayColor })
      addText(value, margin + 60, yPosition, { fontSize: 10, fontStyle: 'bold', color: darkColor })
      yPosition += 6
    })

    yPosition += 8

    // Breakdown Section
    drawLine(margin, yPosition, pageWidth - margin, yPosition, accentColor, 1)
    yPosition += 8

    addText('Closing Cost Breakdown', margin, yPosition, {
      fontSize: 14,
      fontStyle: 'bold',
      color: darkColor
    })
    yPosition += 8

    // Table header background
    doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2])
    doc.rect(margin, yPosition - 5, contentWidth, 6, 'F')

    addText('Item', margin + 5, yPosition, { fontSize: 10, fontStyle: 'bold', color: darkColor })
    addText('Amount', pageWidth - margin - 5, yPosition, { fontSize: 10, fontStyle: 'bold', color: darkColor, align: 'right' })
    yPosition += 8

    drawLine(margin, yPosition, pageWidth - margin, yPosition, [226, 232, 240], 0.3)
    yPosition += 5

    // Breakdown items
    const breakdownItems = [
      ['Down Payment', formatCurrency((homePrice * downPaymentPercent) / 100)],
      ['Loan Origination Fee', formatCurrency(closingCostBreakdown.loanOrigination)],
      ['Appraisal', formatCurrency(closingCostBreakdown.appraisal)],
      ['Home Inspection', formatCurrency(closingCostBreakdown.inspection)],
      ['Title Insurance', formatCurrency(closingCostBreakdown.titleInsurance)],
      ['Transfer Tax', formatCurrency(closingCostBreakdown.transferTax)],
      ['Recording Fees', formatCurrency(closingCostBreakdown.recordingFees)]
    ]

    if (closingCostData.includePrepaids) {
      breakdownItems.push(
        ['Property Tax (2 months)', formatCurrency(closingCostBreakdown.propertyTax)],
        ['Home Insurance (1 year)', formatCurrency(closingCostBreakdown.homeInsurance)],
        ['Prepaid Interest (15 days)', formatCurrency(closingCostBreakdown.prepaidInterest)]
      )
      if (closingCostData.hoaFee > 0) {
        breakdownItems.push(
          ['HOA/Condo Fee (1 month prepaid)', formatCurrency(closingCostBreakdown.hoaPrepaid)]
        )
      }
    }

    breakdownItems.push(['Admin Fee', formatCurrency(closingCostBreakdown.adminFee)])

    if (closingCostData.sellerPaysClosing && closingCostData.sellerContribution > 0) {
      breakdownItems.push(['Seller Contribution (Credit)', `-${formatCurrency(closingCostData.sellerContribution)}`])
    }

    breakdownItems.forEach(([label, value]) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = margin
      }
      addText(label, margin + 5, yPosition, { fontSize: 9, color: darkColor })
      addText(value, pageWidth - margin - 5, yPosition, { fontSize: 9, fontStyle: 'bold', color: darkColor, align: 'right' })
      yPosition += 6
    })

    yPosition += 5
    drawLine(margin, yPosition, pageWidth - margin, yPosition, accentColor, 1)
    yPosition += 8

    // Totals
    addText('Total Closing Costs', margin + 5, yPosition, {
      fontSize: 12,
      fontStyle: 'bold',
      color: darkColor
    })
    addText(formatCurrency(closingCostBreakdown.totalClosingCosts), pageWidth - margin - 5, yPosition, {
      fontSize: 12,
      fontStyle: 'bold',
      color: accentColor,
      align: 'right'
    })
    yPosition += 8

    // Total Cash Needed - highlighted
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2])
    doc.roundedRect(margin, yPosition - 6, contentWidth, 10, 2, 2, 'FD')

    addText('Total Cash Needed', margin + 5, yPosition + 1, {
      fontSize: 14,
      fontStyle: 'bold',
      color: [255, 255, 255],
    })
    addText(formatCurrency(closingCostBreakdown.totalCashNeeded), pageWidth - margin - 5, yPosition + 1, {
      fontSize: 14,
      fontStyle: 'bold',
      color: [255, 255, 255],
      align: 'right'
    })
    yPosition += 15

    // Footer
    if (yPosition > pageHeight - 30) {
      doc.addPage()
      yPosition = margin
    }

    drawLine(margin, yPosition, pageWidth - margin, yPosition, [226, 232, 240], 0.3)
    yPosition += 8

    addText('Note: These are estimates. Actual closing costs may vary based on your lender,', margin, yPosition, {
      fontSize: 8,
      color: grayColor
    })
    yPosition += 4
    addText('property location, and specific transaction details.', margin, yPosition, {
      fontSize: 8,
      color: grayColor
    })
    yPosition += 8

    addText('Generated by Samantha Martinez - Home Buyer Consultation', pageWidth / 2, yPosition, {
      fontSize: 9,
      color: grayColor,
      align: 'center'
    })
    yPosition += 4
    addText('https://samanthamartinez-homebuyer.netlify.app', pageWidth / 2, yPosition, {
      fontSize: 8,
      color: grayColor,
      align: 'center'
    })
    yPosition += 4
    addText(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPosition, {
      fontSize: 8,
      color: grayColor,
      align: 'center'
    })

    // Save PDF - Use blob approach for better mobile compatibility
    try {
      const pdfBlob = doc.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `closing-cost-estimate-${new Date().toISOString().split('T')[0]}.pdf`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      // Clean up after a delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('PDF export error:', error)
      // Fallback to standard save method
      try {
        const fileName = `closing-cost-estimate-${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)
      } catch (fallbackError) {
        console.error('PDF fallback save error:', fallbackError)
        alert('Unable to download PDF. Please try again or use the print option.')
      }
    }
  }

  const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0) || 0
    if (isNaN(numAmount)) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
      setShowBackToTop(window.scrollY > 500)
    }

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    // Observe all sections
    const sections = document.querySelectorAll('.fade-in-section')
    sections.forEach((section) => observer.observe(section))

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Track active chapter based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['game-plan', 'money-talk', 'mortgage-calculator', 'closing-cost-calculator', 'wealth-building', 'winning-offer', 'team-advantage', 'faq', 'glossary', 'contact-section']
      const scrollPosition = window.scrollY + 200

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section && section.offsetTop <= scrollPosition) {
          setActiveChapter(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check on mount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormSubmitted(false)
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required'
    }
    if (!formData.timeline) errors.timeline = 'Please select a timeline'
    if (!formData.locations) errors.locations = 'Please enter locations'
    if (!formData.creditScore) errors.creditScore = 'Please enter credit score'
    if (!formData.married) errors.married = 'Please select marital status'
    if (!formData.downPaymentSaved) errors.downPaymentSaved = 'Please enter down payment saved'
    if (!formData.assistanceNeeded) errors.assistanceNeeded = 'Please select if assistance is needed'
    if (!formData.totalIncome) errors.totalIncome = 'Please enter total income'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setFormSubmitted(true)

    // Brevo (Sendinblue) Configuration
    // Get your API key from: https://app.brevo.com/settings/keys/api
    // See BREVO_SETUP.md for detailed instructions
    // IMPORTANT: Add your API key to .env file: VITE_BREVO_API_KEY=your_key_here
    const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY
    // IMPORTANT: Sender email must be verified in Brevo Dashboard → Settings → SMTP & API → Senders
    // Use your own verified email address for better deliverability
    const BREVO_SENDER_EMAIL = 'samanthardrealty@gmail.com' // Must be verified in Brevo
    const BREVO_RECIPIENT_EMAIL = 'samanthardrealty@gmail.com' // Your email to receive submissions
    const BREVO_TEMPLATE_ID = null // Optional: Your Brevo template ID, or null for plain text

    // Check if API key is configured
    if (!BREVO_API_KEY) {
      console.error('❌ Brevo API key is not configured.')
      console.error('For local development: Add VITE_BREVO_API_KEY to your .env file')
      console.error('For production: Add VITE_BREVO_API_KEY in Netlify Dashboard → Site Settings → Environment Variables')
      console.error('See NETLIFY_ENV_SETUP.md for detailed instructions')
      alert('Form submission is not configured. Please add the Brevo API key in Netlify environment variables. See NETLIFY_ENV_SETUP.md for instructions.')
      setFormSubmitted(false)
      return
    }

    try {
      // Prepare email content
      const emailSubject = `New Contact Form Submission from ${formData.name}`
      const emailContent = `
New contact form submission received:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Timeline: ${formData.timeline || 'Not specified'}
Locations: ${formData.locations || 'Not specified'}
Credit Score: ${formData.creditScore || 'Not specified'}
Married: ${formData.married || 'Not specified'}
Down Payment Saved: ${formData.downPaymentSaved || 'Not specified'}
Assistance Needed: ${formData.assistanceNeeded || 'Not specified'}
Total Income: ${formData.totalIncome || 'Not specified'}

---
This email was sent from your website contact form via Brevo.
      `.trim()

      // Prepare Brevo API request
      const brevoPayload = {
        sender: {
          name: 'Contact Form',
          email: BREVO_SENDER_EMAIL
        },
        to: [
          {
            email: BREVO_RECIPIENT_EMAIL,
            name: 'Samantha Martinez'
          }
        ],
        replyTo: {
          email: formData.email,
          name: formData.name
        },
        subject: emailSubject,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
            <p><strong>Timeline:</strong> ${formData.timeline || 'Not specified'}</p>
            <p><strong>Locations:</strong> ${formData.locations || 'Not specified'}</p>
            <p><strong>Credit Score:</strong> ${formData.creditScore || 'Not specified'}</p>
            <p><strong>Married:</strong> ${formData.married || 'Not specified'}</p>
            <p><strong>Down Payment Saved:</strong> ${formData.downPaymentSaved || 'Not specified'}</p>
            <p><strong>Assistance Needed:</strong> ${formData.assistanceNeeded || 'Not specified'}</p>
            <p><strong>Total Income:</strong> ${formData.totalIncome || 'Not specified'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This email was sent from your website contact form.</p>
          </div>
        `,
        textContent: emailContent
      }

      // If using a template, add template ID and params
      if (BREVO_TEMPLATE_ID) {
        brevoPayload.templateId = parseInt(BREVO_TEMPLATE_ID)
        brevoPayload.params = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || 'Not provided',
          timeline: formData.timeline || 'Not specified'
        }
        // Remove htmlContent and textContent when using template
        delete brevoPayload.htmlContent
        delete brevoPayload.textContent
      }

      // Send email via Brevo API
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY
        },
        body: JSON.stringify(brevoPayload)
      })

      const emailResponseData = await response.json().catch(() => null)

      if (!response.ok) {
        const errorData = emailResponseData || {}
        console.error('❌ Brevo Email Sending Failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          errorMessage: errorData?.message || errorData?.error || 'Unknown error',
          sender: BREVO_SENDER_EMAIL,
          recipient: BREVO_RECIPIENT_EMAIL
        })
        // Don't throw error - still create contact even if email fails
        // throw new Error(`Brevo API error: ${response.status} - ${errorData.message || response.statusText}`)
      } else {
        console.log('✅ Email sent successfully via Brevo:', {
          messageId: emailResponseData?.messageId,
          to: BREVO_RECIPIENT_EMAIL
        })
      }

      // Create/Update contact in Brevo CRM
      // This saves all form data to your Brevo contacts list
      try {
        // Split name into first and last name
        const nameParts = formData.name.trim().split(' ')
        const firstName = nameParts[0] || formData.name
        const lastName = nameParts.slice(1).join(' ') || ''

        // Format timeline for better readability
        const timelineLabels = {
          'asap': 'ASAP - Ready to buy now',
          '1-3': '1-3 Months',
          '3-6': '3-6 Months',
          '6-12': '6-12 Months',
          'browsing': 'Just Browsing - Exploring options'
        }
        const timelineDisplay = timelineLabels[formData.timeline] || formData.timeline || 'Not specified'

        // Format phone number for Brevo (E.164 format: +1234567890)
        // Brevo requires phone numbers in a specific format
        const formatPhoneForBrevo = (phone) => {
          if (!phone) return null

          // Remove all non-digit characters
          const digitsOnly = phone.replace(/\D/g, '')

          // If it's a US number (10 digits), add +1
          if (digitsOnly.length === 10) {
            return `+1${digitsOnly}`
          }

          // If it already starts with +, return as is (assuming it's already formatted)
          if (phone.trim().startsWith('+')) {
            return phone.trim()
          }

          // If it's 11 digits and starts with 1, add +
          if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
            return `+${digitsOnly}`
          }

          // If we can't format it properly, return null (we'll skip phone in contact)
          // Phone will still be in the email notification
          if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
            return `+${digitsOnly}`
          }

          return null
        }

        // Build attributes object - start with only standard Brevo attributes
        // Custom attributes will be created automatically by Brevo on first use
        const contactAttributes = {
          // Standard Brevo attributes (always recognized)
          FIRSTNAME: firstName,
          LASTNAME: lastName || firstName, // Use first name if no last name
        }

        // Add phone if provided and properly formatted (standard Brevo attributes)
        // Note: Only use PHONE, not SMS, to avoid conflicts with existing contacts
        // Brevo doesn't allow the same SMS number on multiple contacts
        const formattedPhone = formatPhoneForBrevo(formData.phone)
        if (formattedPhone) {
          contactAttributes.PHONE = formattedPhone
          // Don't use SMS attribute to avoid "already associated with another Contact" errors
        }

        // Add custom attributes (will be created automatically if they don't exist)
        // Using simpler attribute names to avoid issues
        contactAttributes.TIMELINE = timelineDisplay
        if (formData.timeline) {
          contactAttributes.TIMELINE_VALUE = formData.timeline
        }
        contactAttributes.SOURCE = 'Contact Form'
        contactAttributes.CONTACT_METHOD = 'Website Form'

        const contactPayload = {
          email: formData.email.trim(),
          attributes: contactAttributes,
          updateEnabled: true // Update contact if email already exists
        }

        const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY
          },
          body: JSON.stringify(contactPayload)
        })

        const contactResponseData = await contactResponse.json().catch(() => ({ message: 'Failed to parse error response' }))

        if (!contactResponse.ok) {
          // Log detailed error for debugging
          console.error('❌ Brevo Contact Creation Failed:', {
            status: contactResponse.status,
            statusText: contactResponse.statusText,
            error: contactResponseData,
            errorMessage: contactResponseData?.message || contactResponseData?.error || 'Unknown error',
            payload: contactPayload
          })

          // Try to create contact with minimal attributes if custom attributes failed
          if (contactResponse.status === 400) {
            const errorMessage = contactResponseData?.message || ''
            const isPhoneConflict = errorMessage.includes('SMS is already associated') || errorMessage.includes('already associated with another Contact')

            console.log('🔄 Retrying with minimal attributes...')
            try {
              // If phone number conflict, retry without phone
              const retryFormattedPhone = isPhoneConflict ? null : formatPhoneForBrevo(formData.phone)
              const minimalPayload = {
                email: formData.email.trim(),
                attributes: {
                  FIRSTNAME: firstName,
                  LASTNAME: lastName || firstName,
                  ...(retryFormattedPhone ? { PHONE: retryFormattedPhone } : {})
                },
                updateEnabled: true
              }

              const retryResponse = await fetch('https://api.brevo.com/v3/contacts', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'api-key': BREVO_API_KEY
                },
                body: JSON.stringify(minimalPayload)
              })

              if (retryResponse.ok) {
                console.log('✅ Contact created with minimal attributes')
              } else {
                const retryError = await retryResponse.json().catch(() => ({}))
                console.error('❌ Retry also failed:', retryError)
              }
            } catch (retryError) {
              console.error('❌ Retry error:', retryError)
            }
          }
          // Still show success to user, but log error for debugging
        } else {
          // Success - log for confirmation
          console.log('✅ Contact created/updated in Brevo:', {
            email: formData.email,
            contactId: contactResponseData?.id,
            response: contactResponseData
          })
        }
      } catch (contactError) {
        // Log detailed error for debugging
        console.error('❌ Error creating/updating contact in Brevo:', {
          error: contactError,
          message: contactError.message,
          stack: contactError.stack
        })
      }

      // Netlify Forms submission removed - Brevo is the primary and only method
      // All form submissions go through Brevo API for email notifications and CRM

      setShowSuccessModal(true)
      setFormData({ name: '', email: '', phone: '', timeline: '' })
      setFormErrors({})

      // Track form submission (for analytics)
      if (window.gtag) {
        window.gtag('event', 'form_submission', {
          'event_category': 'engagement',
          'event_label': 'contact_form'
        })
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      console.error('Error details:', {
        message: error.message,
        apiKey: BREVO_API_KEY ? 'Set' : 'Missing'
      })
      // Still show success for better UX, but log the error for debugging
      setShowSuccessModal(true)
      setFormData({ name: '', email: '', phone: '', timeline: '' })
      setFormErrors({})
    } finally {
      setFormSubmitted(false)
    }
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
  }

  const scrollToContact = () => {
    const element = document.getElementById('contact-section')
    if (element) {
      const headerOffset = 80 // Account for header height
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
    setMobileMenuOpen(false) // Close mobile menu after navigation
  }


  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80 // Account for header height
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setActiveChapter(sectionId)
    }
    setMobileMenuOpen(false) // Close mobile menu after navigation
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const chapters = [
    { id: 'game-plan', number: 1, title: 'Process', icon: ListChecks },
    { id: 'money-talk', number: 2, title: 'Budget', icon: DollarSign },
    { id: 'mortgage-calculator', number: 3, title: 'Mortgage Calculator', icon: Calculator },
    { id: 'closing-cost-calculator', number: 4, title: 'Closing Costs', icon: Receipt },
    { id: 'winning-offer', number: 5, title: 'Winning Offer', icon: Trophy },
    { id: 'faq', number: 6, title: 'FAQ', icon: HelpCircle },
    { id: 'glossary', number: 7, title: 'Glossary', icon: BookOpen },
    { id: 'contact-section', number: 8, title: 'Contact Me', icon: Mail }
  ]

  return (
    <div className="landing-page">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar-nav-wrapper">
        <nav className="sidebar-nav">
          <div className="sidebar-nav-content">
            {chapters.map((chapter, index) => {
              const IconComponent = chapter.icon
              return (
                <div key={chapter.id}>
                  <button
                    onClick={() => scrollToSection(chapter.id)}
                    className={`sidebar-button ${activeChapter === chapter.id ? 'active' : ''}`}
                    title={chapter.title}
                    aria-label={chapter.title}
                  >
                    <IconComponent
                      size={20}
                      className="sidebar-icon"
                    />
                  </button>
                  {index < chapters.length - 1 && (
                    <div className={`sidebar-divider ${activeChapter === chapter.id || activeChapter === chapters[index + 1]?.id ? 'active' : ''}`} />
                  )}
                </div>
              )
            })}
          </div>
        </nav>
      </aside>

      {/* STICKY NAVIGATION */}
      <nav
        className={`sticky-nav ${isScrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="nav-container">
          <div className="nav-center-wrapper">
            {/* Left - Name and Badge */}
            <div className="nav-left-wrapper">
              <button
                onClick={scrollToTop}
                className={`nav-logo ${isScrolled ? 'scrolled' : ''}`}
                aria-label="Samantha Martinez - Return to top"
              >
                Samantha Martinez<sup>®</sup>
              </button>
              <div className="nav-badge">
                4th Best Texas Realtor on Social Media
              </div>
            </div>

            {/* Right Side - CTA Button (Desktop) */}
            <div className="nav-cta-desktop">
              <button
                onClick={scrollToContact}
                className="nav-cta"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className={`mobile-menu-toggle ${isScrolled ? 'scrolled' : ''}`}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div
              id="mobile-menu"
              className="mobile-nav-dropdown"
              role="navigation"
              aria-label="Mobile navigation"
            >
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => scrollToSection(chapter.id)}
                  className={`mobile-nav-dropdown-item ${activeChapter === chapter.id ? 'active' : ''}`}
                >
                  {chapter.title}
                </button>
              ))}
              <button
                onClick={() => {
                  scrollToContact()
                  setMobileMenuOpen(false)
                }}
                className="mobile-nav-dropdown-cta"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-layout">
            <div className="hero-text-column">
              <h1 className="hero-title">
                <span className="hero-title-line-1">Buy Your Home</span>
                <span className="hero-title-line-2">with Confidence</span>
              </h1>
              <p className="hero-subtitle">
                <Award size={16} className="inline-icon" /> ELITE Agent at Real Broker <User size={16} className="inline-icon" />
              </p>
              <p className="hero-location">
                <MapPin size={16} className="inline-icon" /> San Antonio | Houston | Dallas <MapPin size={16} className="inline-icon" />
              </p>
              <button className="cta-button primary hero-cta" onClick={scrollToContact}>
                BOOK CONSULTATION
                <ArrowRight size={20} className="arrow-icon" />
              </button>
            </div>
            <div className="hero-image-wrapper">
              <img
                src="/images/samantha-profile-4.png"
                alt="Samantha Martinez - Expert Real Estate Agent for Home Buyers in San Antonio, Houston, and Dallas"
                className="hero-photo"
                onClick={() => setShowPhotoModal(true)}
                onError={(e) => {
                  // Fallback to placeholder if image doesn't exist
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="hero-photo-placeholder" style={{ display: 'none' }}>
                <Camera size={48} style={{ color: '#52525B' }} />
                <p>Add Your Professional Photo Here</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFINITE SCROLL MARQUEE */}
      <section className="marquee-section">
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="marquee-item"><Award size={16} className="inline-icon" /> 4th Best Texas Realtor on Social Media</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><Star size={16} className="inline-icon" /> ELITE Agent at Real Broker</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><ThumbsUp size={16} className="inline-icon" /> 5.0 Perfect Client Rating</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><MapPin size={16} className="inline-icon" /> San Antonio • Houston • Dallas</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><Home size={16} className="inline-icon" /> Buying • Selling • New Construction Specialist</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><Users size={16} className="inline-icon" /> First-Time & Repeat Buyer Expert</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><MapPin size={16} className="inline-icon" /> Serving San Antonio, Houston & Dallas</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><Award size={16} className="inline-icon" /> 4th Best Texas Realtor on Social Media</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><Star size={16} className="inline-icon" /> ELITE Agent at Real Broker</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><ThumbsUp size={16} className="inline-icon" /> 5.0 Perfect Client Rating</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><MapPin size={16} className="inline-icon" /> San Antonio • Houston • Dallas</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><Home size={16} className="inline-icon" /> Buying • Selling • New Construction Specialist</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><Users size={16} className="inline-icon" /> First-Time & Repeat Buyer Expert</span>
            <span className="marquee-dot">•</span>
            <span className="marquee-item"><MapPin size={16} className="inline-icon" /> Serving San Antonio, Houston & Dallas</span>
            <span className="marquee-dot">•</span>
          </div>
        </div>
      </section>

      {/* AREAS WE SERVE SECTION */}
      <section id="areas-served" className="areas-served fade-in-section">
        <div className="container">
          <h2 className="section-title">Areas We Serve in Texas</h2>
          <p className="section-subtitle">Licensed in Texas - serving San Antonio, Houston, and Dallas</p>
          <div className="locations-grid">
            <div className="location-card">
              <h3 className="location-title">San Antonio & Surrounding</h3>
              <ul className="location-list">
                <li>San Antonio</li>
                <li>New Braunfels</li>
                <li>San Marcos</li>
                <li>Seguin</li>
                <li>Boerne</li>
                <li>Cibolo</li>
                <li>Schertz</li>
                <li>Universal City</li>
                <li>Live Oak</li>
                <li>Helotes</li>
                <li>Alamo Heights</li>
                <li>And all Bexar County areas</li>
              </ul>
            </div>
            <div className="location-card">
              <h3 className="location-title">Houston & Surrounding</h3>
              <ul className="location-list">
                <li>Houston</li>
                <li>The Woodlands</li>
                <li>Sugar Land</li>
                <li>Katy</li>
                <li>Pearland</li>
                <li>Cypress</li>
                <li>Spring</li>
                <li>League City</li>
                <li>Pasadena</li>
                <li>And all Harris County areas</li>
              </ul>
            </div>
            <div className="location-card">
              <h3 className="location-title">Dallas & Surrounding</h3>
              <ul className="location-list">
                <li>Dallas</li>
                <li>Fort Worth</li>
                <li>Arlington</li>
                <li>Plano</li>
                <li>Irving</li>
                <li>Garland</li>
                <li>Frisco</li>
                <li>McKinney</li>
                <li>Grand Prairie</li>
                <li>And all DFW areas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: WINNING GAME PLAN */}
      <section id="game-plan" className="game-plan fade-in-section">
        <div className="container">
          <h2 className="section-title">Our 4-Step Winning Game Plan</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Get "Power-Buyer" Ready</h3>
              <p className="step-description">
                It all starts here. As your realtor, I'll connect you with our trusted local lenders to get you fully Pre-Approved (not just Pre-Qualified!).
              </p>
              <p className="step-description">
                This makes you a 'power-buyer' and sets you up to win from day one. <strong>Ask me more about how pre-approval gives you a competitive edge.</strong>
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">The "Priority Access" Hunt</h3>
              <p className="step-description">
                This is the fun part! As your realtor, I'll set you up with <strong>real-time MLS alerts</strong> (not 24-hour-delayed Zillow data).
              </p>
              <p className="step-description">
                Plus, you'll get access to our exclusive <strong>'Priority Access' list</strong> of off-market homes you can't find online. <strong>Work with me to see homes before they hit the market!</strong>
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Craft the Winning Offer</h3>
              <p className="step-description">
                Found 'the one'? Now, as your realtor, I put our experience to work for you.
              </p>
              <p className="step-description">
                We'll analyze comparable sales, seller motivations, and market conditions to craft an offer that stands out—even when there are 10+ competing bids. <strong>Ask me more about our winning offer strategies.</strong>
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">Close, Get Your Keys & Party!</h3>
              <p className="step-description">
                As your realtor, I handle every detail from contract to closing. <strong>Our average closing time: 30 days.</strong>
              </p>
              <p className="step-description">
                And yes, we really do throw housewarming parties for our clients! When you work with me, you become part of the family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MONEY TALK */}
      <section id="money-talk" className="money-talk fade-in-section">
        <div className="container">
          <h2 className="section-title">Money Talk</h2>
          <p className="section-subtitle">No surprises. Here's what to expect financially.</p>
          <div className="money-grid">
            <div className="money-card">
              <h3 className="money-card-title"><span className="tooltip-trigger" data-tooltip="Pre-Qualified: A quick estimate based on basic information you provide. Not verified by a lender.">Pre-Qualified</span> vs. <span className="tooltip-trigger" data-tooltip="Pre-Approved: A thorough qualification with document verification. This makes you a serious buyer and lets you act fast. Required to be competitive in today's market.">Pre-Approved</span></h3>
              <div className="comparison-item">
                <div className="comparison-badge">7 Mins</div>
                <h4>Pre-Qualified</h4>
                <p>A quick, 7-minute chat to understand your comfort zone. Free, no-obligation.</p>
              </div>
              <div className="comparison-item featured">
                <div className="comparison-badge">The Real Deal</div>
                <h4>Pre-Approved</h4>
                <p>This is the one you want. It's a thorough qualification with document verification. This makes you a serious buyer and lets us act fast.</p>
              </div>
            </div>
            <div className="money-card">
              <h3 className="money-card-title">What to Budget For</h3>
              <p className="money-card-subtitle">Here's a simple breakdown of your potential costs. We'll walk you through every line item.</p>
              <ul className="cost-list">
                <li>
                  <span className="cost-icon"><DollarSign size={24} /></span>
                  <div>
                    <strong>Down Payment</strong>
                    <span>3%+</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon"><FileText size={24} /></span>
                  <div>
                    <strong><span className="tooltip-trigger" data-tooltip="Closing Costs: Fees paid at settlement including appraisal, inspection, title insurance, loan origination, and recording fees. Typically 2.5-3% of home price in the DFW area.">Closing Costs</span></strong>
                    <span>~2.5% - 3%</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon"><Coins size={24} /></span>
                  <div>
                    <strong>Earnest Money Deposit (<span className="tooltip-trigger" data-tooltip="Earnest Money Deposit: A good-faith deposit showing you're serious about buying. Held in escrow and credited back at closing.">EMD</span>)</strong>
                    <span>3%+</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon"><Search size={24} /></span>
                  <div>
                    <strong><span className="tooltip-trigger" data-tooltip="Home Inspection: A professional evaluation of the property's condition, including structural elements, systems (HVAC, plumbing, electrical), and safety concerns. Allows you to negotiate repairs or withdraw if major issues are found.">Home Inspection</span></strong>
                    <span>~$350 - $750</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon"><BarChart3 size={24} /></span>
                  <div>
                    <strong><span className="tooltip-trigger" data-tooltip="Appraisal: A professional assessment of the home's value by a licensed appraiser. Required by lenders to ensure the property is worth the loan amount. If the appraisal comes in lower than your offer, you can renegotiate or walk away.">Appraisal</span></strong>
                    <span>~$400 - $600+</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon"><CheckCircle size={24} /></span>
                  <div>
                    <strong>Buyer's Commission</strong>
                    <span>3% (Typically paid by the Seller)</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon"><Clipboard size={24} /></span>
                  <div>
                    <strong><span className="tooltip-trigger" data-tooltip="Admin Fee: A standard fee charged by real estate brokerages to cover administrative costs associated with your transaction. This $495 fee helps cover document processing, transaction coordination, compliance requirements, and administrative support throughout your home buying process. This fee is standard in the industry and is typically paid at closing.">Admin Fee</span></strong>
                    <span>${ADMIN_FEE}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MORTGAGE CALCULATOR */}
      <section id="mortgage-calculator" className="mortgage-calculator fade-in-section">
        <div className="container">
          <h2 className="section-title">Mortgage Payment Calculator</h2>
          <p className="section-subtitle">Get an estimate of your monthly mortgage payment. Adjust the numbers to see how different scenarios affect your payment.</p>

          <div className="calculator-wrapper">
            <div className="calculator-inputs">
              <div className="calc-input-group">
                <label htmlFor="homePrice">Home Price</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    id="homePrice"
                    name="homePrice"
                    value={calculatorData.homePrice}
                    onChange={handleCalculatorChange}
                    placeholder="500,000"
                    className="calc-input"
                  />
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="downPaymentPercent">Down Payment (%)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="downPaymentPercent"
                    name="downPaymentPercent"
                    value={calculatorData.downPaymentPercent}
                    onChange={handleCalculatorChange}
                    min="0"
                    max="100"
                    step="0.5"
                    className="calc-input"
                  />
                  <span className="input-suffix">%</span>
                </div>
                <div className="down-payment-amount">
                  {calculatorData.homePrice && calculatorData.downPaymentPercent
                    ? formatCurrency((parseFloat((calculatorData.homePrice?.toString() || '0').replace(/,/g, '')) * parseFloat(calculatorData.downPaymentPercent || 0)) / 100) + ' down'
                    : '$0 down'}
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="interestRate">Interest Rate (%)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="interestRate"
                    name="interestRate"
                    value={calculatorData.interestRate}
                    onChange={handleCalculatorChange}
                    min="0"
                    max="20"
                    step="0.1"
                    className="calc-input"
                  />
                  <span className="input-suffix">%</span>
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="loanTerm">Loan Term</label>
                <select
                  id="loanTerm"
                  name="loanTerm"
                  value={calculatorData.loanTerm}
                  onChange={handleCalculatorChange}
                  className="calc-select"
                >
                  <option value="15">15 years</option>
                  <option value="20">20 years</option>
                  <option value="30">30 years</option>
                </select>
              </div>

            </div>

            <div className="calculator-results">
              <div className="result-card primary">
                <div className="result-label">Monthly Payment</div>
                <div className="result-value">{formatCurrency(monthlyPayment)}</div>
                <div className="result-note">Principal & Interest (does not include taxes, insurance, or HOA/Condo fees)</div>
              </div>

              <div className="result-details">
                <div className="result-row">
                  <span className="result-label-small">Down Payment</span>
                  <span className="result-value-small">
                    {calculatorData.homePrice && calculatorData.downPaymentPercent
                      ? formatCurrency((parseFloat((calculatorData.homePrice?.toString() || '0').replace(/,/g, '')) * parseFloat(calculatorData.downPaymentPercent || 0)) / 100)
                      : '$0'}
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label-small">Loan Amount</span>
                  <span className="result-value-small">
                    {calculatorData.homePrice && calculatorData.downPaymentPercent
                      ? formatCurrency(parseFloat((calculatorData.homePrice?.toString() || '0').replace(/,/g, '')) - ((parseFloat((calculatorData.homePrice?.toString() || '0').replace(/,/g, '')) * parseFloat(calculatorData.downPaymentPercent || 0)) / 100))
                      : '$0'}
                  </span>
                </div>
              </div>

              <div className="calculator-cta">
                <p><strong>Keep in mind:</strong> The mortgage payment calculations above are just estimates. If you'd like real deal numbers, you need to get a pre-approval from a mortgage lender. As your realtor, I'll connect you with our trusted lenders who can provide accurate, personalized numbers based on your specific financial situation. <strong>Ask me more about the pre-approval process.</strong></p>
                <button className="cta-button primary" onClick={scrollToContact}>
                  Get Pre-Approved Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING COST CALCULATOR */}
      <section id="closing-cost-calculator" className="closing-cost-calculator fade-in-section">
        <div className="container">
          <h2 className="section-title">Closing Cost Calculator</h2>
          <p className="section-subtitle">
            Estimate your total closing costs and cash needed to buy a home in the DFW area.
            Get a detailed breakdown of all fees and expenses.
          </p>

          <div className="calculator-wrapper">
            <div className="calculator-inputs">
              {calculatorData.homePrice && calculatorData.downPaymentPercent && (
                <div className="calc-input-group">
                  <button
                    type="button"
                    onClick={copyFromMortgageCalculator}
                    className="copy-from-mortgage-btn"
                  >
                    <Copy size={16} />
                    Copy from Mortgage Calculator
                  </button>
                </div>
              )}

              <div className="calc-input-group">
                <label htmlFor="cc-homePrice">Home Price</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    id="cc-homePrice"
                    name="homePrice"
                    value={closingCostData.homePrice}
                    onChange={handleClosingCostChange}
                    placeholder="500,000"
                    className="calc-input"
                  />
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="cc-downPaymentPercent">Down Payment (%)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="cc-downPaymentPercent"
                    name="downPaymentPercent"
                    value={closingCostData.downPaymentPercent}
                    onChange={handleClosingCostChange}
                    min="0"
                    max="100"
                    step="0.5"
                    className="calc-input"
                  />
                  <span className="input-suffix">%</span>
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="cc-state">State</label>
                <div className="select-wrapper">
                  <select
                    id="cc-state"
                    name="state"
                    value={closingCostData.state}
                    onChange={handleClosingCostChange}
                    className="calc-select"
                  >
                    <option value="TX">Texas</option>
                  </select>
                  <ChevronDown className="select-arrow" size={20} />
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="cc-county">County/City (for accurate tax rate)</label>
                <div className="select-wrapper">
                  <select
                    id="cc-county"
                    name="county"
                    value={closingCostData.county}
                    onChange={handleClosingCostChange}
                    className="calc-select"
                  >
                    <option value="">Select County/City</option>
                    {closingCostData.state === 'TX' && (
                      <>
                        {/* Dallas & Surrounding Areas */}
                        <optgroup label="Dallas & Surrounding Areas">
                          <option value="Dallas">Dallas</option>
                          <option value="Irving">Irving</option>
                          <option value="Garland">Garland</option>
                          <option value="Richardson">Richardson</option>
                          <option value="Grand Prairie">Grand Prairie</option>
                          <option value="Arlington">Arlington</option>
                          <option value="Fort Worth">Fort Worth</option>
                          <option value="Desoto">Desoto</option>
                          <option value="Duncanville">Duncanville</option>
                          <option value="Lancaster">Lancaster</option>
                          <option value="Cedar Hill">Cedar Hill</option>
                          <option value="Dallas County (Other)">Dallas County (Other)</option>
                        </optgroup>
                        {/* Frisco, Plano & North Dallas */}
                        <optgroup label="Frisco, Plano & North Dallas">
                          <option value="Frisco">Frisco</option>
                          <option value="Plano">Plano</option>
                          <option value="McKinney">McKinney</option>
                          <option value="Allen">Allen</option>
                          <option value="Addison">Addison</option>
                          <option value="Carrollton">Carrollton</option>
                          <option value="Lewisville">Lewisville</option>
                          <option value="Collin County (Other)">Collin County (Other)</option>
                        </optgroup>
                        {/* Celina, Prosper & More */}
                        <optgroup label="Celina, Prosper & More">
                          <option value="Celina">Celina</option>
                          <option value="Prosper">Prosper</option>
                          <option value="Aubrey">Aubrey</option>
                          <option value="Forney">Forney</option>
                          <option value="Midlothian">Midlothian</option>
                          <option value="North Richland Hills">North Richland Hills</option>
                          <option value="Other DFW Communities">Other DFW Communities</option>
                        </optgroup>
                      </>
                    )}
                  </select>
                  <ChevronDown className="select-arrow" size={20} />
                </div>
                <small className="input-help">
                  {closingCostData.county
                    ? `Tax rate set to ${closingCostData.propertyTaxRate}% for ${closingCostData.county}`
                    : `Select county for accurate rate, or use state default: ${stateDefaultTaxRates[closingCostData.state]}%`}
                </small>
              </div>

              <div className="calc-input-group">
                <label htmlFor="cc-loanType">Loan Type</label>
                <div className="select-wrapper">
                  <select
                    id="cc-loanType"
                    name="loanType"
                    value={closingCostData.loanType}
                    onChange={handleClosingCostChange}
                    className="calc-select"
                  >
                    <option value="conventional">Conventional</option>
                    <option value="FHA">FHA</option>
                    <option value="VA">VA Loan</option>
                  </select>
                  <ChevronDown className="select-arrow" size={20} />
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="cc-propertyType">Property Type</label>
                <div className="select-wrapper">
                  <select
                    id="cc-propertyType"
                    name="propertyType"
                    value={closingCostData.propertyType}
                    onChange={handleClosingCostChange}
                    className="calc-select"
                  >
                    <option value="single-family">Single Family Home</option>
                    <option value="townhome">Townhome</option>
                    <option value="condo">Condo</option>
                  </select>
                  <ChevronDown className="select-arrow" size={20} />
                </div>
                <small className="input-help">Select property type to auto-populate typical insurance range</small>
              </div>

              <div className="calc-input-group">
                <label htmlFor="cc-propertyTaxRate">Annual Property Tax Rate (%)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="cc-propertyTaxRate"
                    name="propertyTaxRate"
                    value={closingCostData.propertyTaxRate}
                    onChange={handleClosingCostChange}
                    min="0"
                    max="5"
                    step="0.01"
                    className="calc-input"
                  />
                  <span className="input-suffix">%</span>
                </div>
                <small className="input-help">
                  {closingCostData.county
                    ? `Auto-set for ${closingCostData.county}. You can adjust manually if needed.`
                    : 'TX default: 2.10%. Select county above for accurate rate.'}
                </small>
              </div>

              <div className="calc-input-group">
                <label htmlFor="cc-homeInsurance">Annual Home Insurance</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    id="cc-homeInsurance"
                    name="homeInsurance"
                    value={closingCostData.homeInsurance}
                    onChange={handleClosingCostChange}
                    min="0"
                    step="50"
                    className="calc-input"
                  />
                </div>
                <div className="insurance-recommendations">
                  {closingCostData.propertyType === 'single-family' && (
                    <div className="recommendation-box">
                      <strong>Single Family Home Recommendations:</strong>
                      <ul>
                        <li>Typical range: <strong>$1,200 - $2,000/year</strong></li>
                        <li>Homes under $500K: ~$1,200-$1,500/year</li>
                        <li>Homes $500K-$750K: ~$1,500-$1,800/year</li>
                        <li>Homes over $750K: ~$1,800-$2,000+/year</li>
                        <li>Covers: Structure, personal property, liability, and dwelling protection</li>
                      </ul>
                    </div>
                  )}
                  {closingCostData.propertyType === 'townhome' && (
                    <div className="recommendation-box">
                      <strong>Townhome Recommendations:</strong>
                      <ul>
                        <li>Typical range: <strong>$800 - $1,400/year</strong></li>
                        <li>Lower cost than single-family due to shared walls</li>
                        <li>Homes under $500K: ~$800-$1,100/year</li>
                        <li>Homes $500K-$750K: ~$1,100-$1,300/year</li>
                        <li>Homes over $750K: ~$1,300-$1,400+/year</li>
                        <li>Covers: Interior structure, personal property, liability (exterior often covered by HOA)</li>
                      </ul>
                    </div>
                  )}
                  {closingCostData.propertyType === 'condo' && (
                    <div className="recommendation-box">
                      <strong>Condo Recommendations:</strong>
                      <ul>
                        <li>Typical range: <strong>$300 - $700/year</strong> - Adjust based on property size</li>
                        <li>HOA master policy covers: Building structure, common areas, exterior</li>
                        <li>Your policy covers: Interior walls, personal property, liability, improvements</li>
                        <li>Studios/1BR: ~$300-$450/year</li>
                        <li>2BR: ~$450-$600/year</li>
                        <li>3BR+: ~$600-$700+/year</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="cc-hoaFee">Monthly HOA/Condo Fee (if applicable)</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    id="cc-hoaFee"
                    name="hoaFee"
                    value={closingCostData.hoaFee}
                    onChange={handleClosingCostChange}
                    min="0"
                    step="50"
                    className="calc-input"
                  />
                </div>
              </div>

              <div className="calc-input-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="includePrepaids"
                    checked={closingCostData.includePrepaids}
                    onChange={handleClosingCostChange}
                  />
                  Include prepaid items (insurance, property tax, interest)
                </label>
              </div>

              <div className="calc-input-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="sellerPaysClosing"
                    checked={closingCostData.sellerPaysClosing}
                    onChange={handleClosingCostChange}
                  />
                  Seller is contributing to closing costs
                </label>
              </div>

              {closingCostData.sellerPaysClosing && (
                <div className="calc-input-group">
                  <label htmlFor="cc-sellerContribution">Seller Contribution Amount</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      id="cc-sellerContribution"
                      name="sellerContribution"
                      value={closingCostData.sellerContribution}
                      onChange={handleClosingCostChange}
                      min="0"
                      step="500"
                      className="calc-input"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="calculator-results">
              <div className="result-card primary">
                <div className="result-label">Total Cash Needed</div>
                <div className="result-value">{formatCurrency(closingCostBreakdown.totalCashNeeded)}</div>
                <div className="result-note">Down Payment + Closing Costs</div>
              </div>

              <div className="result-card secondary">
                <div className="result-label">Total Closing Costs</div>
                <div className="result-value">{formatCurrency(closingCostBreakdown.totalClosingCosts)}</div>
              </div>

              <div className="closing-cost-breakdown">
                <div className="breakdown-header">
                  <h4 className="breakdown-title">Closing Cost Breakdown</h4>
                  <div className="breakdown-actions">
                    <button
                      type="button"
                      onClick={printClosingCosts}
                      className="action-btn"
                      title="Print"
                      aria-label="Print closing costs"
                    >
                      <Printer size={18} />
                      <span>Print</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportClosingCosts}
                      className="action-btn"
                      title="Export"
                      aria-label="Export closing costs"
                    >
                      <Download size={18} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <div className="breakdown-list">
                  <div className="breakdown-item">
                    <div className="breakdown-item-label">
                      <span>Down Payment</span>
                      <span className="tooltip-icon" data-tooltip="The initial cash amount you pay toward the purchase price. This is your equity stake in the property from day one.">
                        <Info size={14} />
                      </span>
                    </div>
                    <span className="breakdown-value">
                      {closingCostData.homePrice && closingCostData.downPaymentPercent
                        ? formatCurrency((parseFloat((closingCostData.homePrice?.toString() || '0').replace(/,/g, '')) * parseFloat(closingCostData.downPaymentPercent || 0)) / 100)
                        : '$0'}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-item-label">
                      <span>Loan Origination Fee</span>
                      <span className="tooltip-icon" data-tooltip="A fee charged by the lender for processing your loan application. Typically 0.5-1% of the loan amount. This covers the cost of underwriting, processing, and funding your mortgage.">
                        <Info size={14} />
                      </span>
                    </div>
                    <span className="breakdown-value">{formatCurrency(closingCostBreakdown.loanOrigination)}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-item-label">
                      <span>Appraisal</span>
                      <span className="tooltip-icon" data-tooltip="A professional assessment of the home's value by a licensed appraiser. Required by lenders to ensure the property is worth the loan amount. In the DFW area, typically costs $400-$600+ depending on property size.">
                        <Info size={14} />
                      </span>
                    </div>
                    <span className="breakdown-value">{formatCurrency(closingCostBreakdown.appraisal)}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-item-label">
                      <span>Home Inspection</span>
                      <span className="tooltip-icon" data-tooltip="A professional evaluation of the property's condition, including structural elements, systems (HVAC, plumbing, electrical), and safety concerns. In the DFW area, typically costs $350-$750. Allows you to negotiate repairs or withdraw if major issues are found.">
                        <Info size={14} />
                      </span>
                    </div>
                    <span className="breakdown-value">{formatCurrency(closingCostBreakdown.inspection)}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-item-label">
                      <span>Title Insurance</span>
                      <span className="tooltip-icon" data-tooltip="Insurance that protects you and your lender from ownership disputes, liens, or other title issues. Texas rates: ~0.5-0.7% of loan amount.">
                        <Info size={14} />
                      </span>
                    </div>
                    <span className="breakdown-value">{formatCurrency(closingCostBreakdown.titleInsurance)}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-item-label">
                      <span>Transfer Tax</span>
                      <span className="tooltip-icon" data-tooltip="A tax on the transfer of property ownership. Texas: Generally no state transfer tax for buyers. Some local jurisdictions may have small fees, but most DFW areas do not charge transfer tax to buyers.">
                        <Info size={14} />
                      </span>
                    </div>
                    <span className="breakdown-value">{formatCurrency(closingCostBreakdown.transferTax)}</span>
                  </div>
                  <div className="breakdown-item">
                    <div className="breakdown-item-label">
                      <span>Recording Fees</span>
                      <span className="tooltip-icon" data-tooltip="Fees paid to the local government to record the deed and mortgage documents in public records. Typically $200-$300 depending on state and county.">
                        <Info size={14} />
                      </span>
                    </div>
                    <span className="breakdown-value">{formatCurrency(closingCostBreakdown.recordingFees)}</span>
                  </div>
                  {closingCostData.includePrepaids && (
                    <>
                      <div className="breakdown-item">
                        <div className="breakdown-item-label">
                          <span>Property Tax (2 months)</span>
                          <span className="tooltip-icon" data-tooltip="Prepaid property taxes for the first 2 months. This ensures your property taxes are paid in advance. Amount varies based on your property tax rate and home value.">
                            <Info size={14} />
                          </span>
                        </div>
                        <span className="breakdown-value">{formatCurrency(closingCostBreakdown.propertyTax)}</span>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-item-label">
                          <span>Home Insurance (1 year)</span>
                          <span className="tooltip-icon" data-tooltip="First year of homeowners insurance paid upfront. Required by lenders to protect their investment. Typical range in DFW: $1,200-$2,000 per year depending on home value and coverage.">
                            <Info size={14} />
                          </span>
                        </div>
                        <span className="breakdown-value">{formatCurrency(closingCostBreakdown.homeInsurance)}</span>
                      </div>
                      <div className="breakdown-item">
                        <div className="breakdown-item-label">
                          <span>Prepaid Interest (15 days)</span>
                          <span className="tooltip-icon" data-tooltip="Interest on your loan from the closing date until your first mortgage payment. Typically covers 15 days of interest based on your loan amount and interest rate.">
                            <Info size={14} />
                          </span>
                        </div>
                        <span className="breakdown-value">{formatCurrency(closingCostBreakdown.prepaidInterest)}</span>
                      </div>
                      {closingCostData.hoaFee > 0 && (
                        <div className="breakdown-item">
                          <div className="breakdown-item-label">
                            <span>HOA/Condo Fee (1 month prepaid)</span>
                            <span className="tooltip-icon" data-tooltip="One month of HOA or condo fees paid in advance at closing. This is standard practice to ensure the HOA is paid ahead of time.">
                              <Info size={14} />
                            </span>
                          </div>
                          <span className="breakdown-value">{formatCurrency(closingCostBreakdown.hoaPrepaid)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="breakdown-item">
                    <div className="breakdown-item-label">
                      <span>Admin Fee</span>
                      <span className="tooltip-icon" data-tooltip="A standard fee charged by real estate brokerages to cover administrative costs associated with your transaction. This $495 fee helps cover document processing, transaction coordination, compliance requirements, and administrative support throughout your home buying process.">
                        <Info size={14} />
                      </span>
                    </div>
                    <span className="breakdown-value">{formatCurrency(closingCostBreakdown.adminFee)}</span>
                  </div>
                  {closingCostData.sellerPaysClosing && closingCostData.sellerContribution > 0 && (
                    <div className="breakdown-item discount">
                      <div className="breakdown-item-label">
                        <span>Seller Contribution (Credit)</span>
                        <span className="tooltip-icon" data-tooltip="A credit from the seller toward your closing costs. This can be negotiated as part of your offer and reduces the amount you need to bring to closing.">
                          <Info size={14} />
                        </span>
                      </div>
                      <span className="breakdown-value">-{formatCurrency(closingCostData.sellerContribution)}</span>
                    </div>
                  )}
                  <div className="breakdown-item total">
                    <span>Total Closing Costs</span>
                    <span className="breakdown-value">{formatCurrency(closingCostBreakdown.totalClosingCosts)}</span>
                  </div>
                </div>
              </div>

              <div className="calculator-cta">
                <p>
                  <strong>Note:</strong> These are estimates. Actual closing costs may vary based on your lender,
                  property location, and specific transaction details. <strong>As your realtor, I'll help you
                    understand every fee and negotiate the best terms.</strong>
                </p>
                <button className="cta-button primary" onClick={scrollToContact}>
                  Get Your Personalized Estimate
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: WEALTH BUILDING */}
      <section id="wealth-building" className="wealth-building fade-in-section">
        <div className="container">
          <h2 className="section-title">This Isn't Just a Home. It's Your Biggest Wealth-Builder.</h2>
          <p className="section-subtitle">See how you earn appreciation on the total value of your home, not just your down payment.</p>
          <div className="wealth-example">
            <h3 className="wealth-example-title">The Power of "Leveraged Returns"</h3>
            <div className="wealth-scenario">
              <div className="scenario-item">
                <span className="scenario-label">House Price:</span>
                <span className="scenario-value">$650,000</span>
              </div>
              <div className="scenario-item">
                <span className="scenario-label">Your 10% Down Payment:</span>
                <span className="scenario-value">$65,000</span>
              </div>
            </div>
            <div className="roi-cards">
              <div className="roi-card">
                <div className="roi-period">IN 5 YEARS</div>
                <div className="roi-amount">$120,250</div>
                <div className="roi-label">Total Net Gain</div>
                <div className="roi-percentage">ROI: 185%</div>
              </div>
              <div className="roi-card">
                <div className="roi-period">IN 10 YEARS</div>
                <div className="roi-amount">$261,300</div>
                <div className="roi-label">Total Net Gain</div>
                <div className="roi-percentage">ROI: 402%</div>
              </div>
              <div className="roi-card">
                <div className="roi-period">IN 20 YEARS</div>
                <div className="roi-amount">$620,100</div>
                <div className="roi-label">Total Net Gain</div>
                <div className="roi-percentage">ROI: 954%</div>
              </div>
            </div>

            {/* Renting vs. Buying Comparison */}
            <div className="rent-vs-buy-comparison">
              <h3 className="comparison-title">Renting vs. Buying: The Wealth Gap</h3>
              <p className="comparison-subtitle">See how buying builds wealth while renting builds someone else's</p>
              <div style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '0.95rem', color: '#718096', fontStyle: 'italic' }}>
                <p style={{ margin: '0.5rem 0' }}>
                  Based on a monthly rent of <strong>$1,500/month</strong> for a comparable property
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  Assumes <strong>3% annual appreciation</strong> (15.9% over 5 years, 34.4% over 10 years, 80.6% over 20 years)
                </p>
              </div>
              <div className="comparison-grid">
                <div className="comparison-column rent-column">
                  <div className="comparison-header">RENTING</div>
                  <div className="comparison-item">
                    <div className="comparison-period">5 Years</div>
                    <div className="comparison-amount negative">-$90,000</div>
                    <div className="comparison-detail">Total Rent Paid</div>
                    <div className="comparison-note">No equity • No tax benefits • No wealth building</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-period">10 Years</div>
                    <div className="comparison-amount negative">-$180,000</div>
                    <div className="comparison-detail">Total Rent Paid</div>
                    <div className="comparison-note">Still no equity • Rent increases over time</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-period">20 Years</div>
                    <div className="comparison-amount negative">-$360,000</div>
                    <div className="comparison-detail">Total Rent Paid</div>
                    <div className="comparison-note">Zero wealth created • No asset to show</div>
                  </div>
                </div>
                <div className="comparison-column buy-column">
                  <div className="comparison-header">BUYING</div>
                  <div className="comparison-item">
                    <div className="comparison-period">5 Years</div>
                    <div className="comparison-amount positive">+$120,250</div>
                    <div className="comparison-detail">Net Wealth Created</div>
                    <div className="comparison-note">Equity + Appreciation • Tax benefits • Building wealth</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-period">10 Years</div>
                    <div className="comparison-amount positive">+$261,300</div>
                    <div className="comparison-detail">Net Wealth Created</div>
                    <div className="comparison-note">Significant equity • Appreciation continues</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-period">20 Years</div>
                    <div className="comparison-amount positive">+$620,100</div>
                    <div className="comparison-detail">Net Wealth Created</div>
                    <div className="comparison-note">Massive equity • Potential to own outright</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Benefits Callout */}
            <div className="tax-benefits-callout">
              <div className="tax-icon"><DollarSign size={48} /></div>
              <div className="tax-content">
                <h3 className="tax-title">Tax Benefits of Homeownership</h3>
                <p className="tax-description">
                  As a homeowner, you may be eligible for significant tax deductions:
                </p>
                <ul className="tax-list">
                  <li><strong>Mortgage Interest Deduction:</strong> Deduct interest paid on your mortgage (up to $750,000 loan amount)</li>
                  <li><strong>Property Tax Deduction:</strong> Deduct state and local property taxes paid</li>
                  <li><strong>Potential Savings:</strong> These deductions can save you thousands in taxes each year, effectively reducing your monthly housing cost</li>
                </ul>
                <p className="tax-note">
                  <em>Note: Tax benefits vary based on individual circumstances. Consult with a tax professional for advice specific to your situation.</em>
                </p>
              </div>
            </div>

            <p className="wealth-takeaway">
              This is why more wealth is created in real estate than any other sector. You're not just paying a mortgage—you're paying yourself.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: PRIORITY ACCESS */}
      <section id="priority-access" className="priority-access fade-in-section">
        <div className="container">
          <h2 className="section-title">Your Secret Weapon: The Priority Access Program</h2>
          <div className="priority-content">
            <div className="priority-visual">
              <div className="house-icon locked"><Home size={48} /></div>
              <div className="arrow"><ArrowRight size={32} /></div>
              <div className="house-icon unlocked"><Home size={48} /></div>
            </div>
            <p className="priority-text">
              Why limit your search to what's on Zillow? As my client, you get exclusive access to homes NOT listed
              anywhere online. We find these 'hidden gems' through our massive seller database, agent referral network, and
              targeted marketing. You get first dibs!
            </p>
          </div>
        </div>
      </section>

      {/* CRAFTING A WINNING OFFER */}
      <section id="winning-offer" className="winning-offer fade-in-section">
        <div className="container">
          <h2 className="section-title">Crafting a Winning Offer</h2>

          <div className="offer-components-grid">
            <div className="offer-component-card">
              <div className="component-icon"><Calendar size={32} /></div>
              <div className="component-content">
                <h3 className="component-title">Closing Date</h3>
                <p className="component-subtitle">Also called Settlement date</p>
                <p className="component-description">
                  We'll find out what timeframe the seller prefers before submitting your offer. This ensures you get a closing date that works for you while keeping the seller happy.
                </p>
                <p className="component-description">
                  <strong>Typical timeframe:</strong> 21-30 days is most common in the DFW area, though it can range from 15-90 days depending on the seller's needs. <strong>As your realtor, I'll help you negotiate the best closing date for your situation.</strong>
                </p>
              </div>
            </div>

            <div className="offer-component-card">
              <div className="component-icon"><Home size={32} /></div>
              <div className="component-content">
                <h3 className="component-title">Post Settlement Occupancy</h3>
                <p className="component-description">
                  Sometimes a seller will request a "rent back"—allowing them to stay in the home after closing. This can be a very compelling tactic that sets your offer apart.
                </p>
                <p className="component-description">
                  <strong>Why it works:</strong> If the seller needs to buy another home, they get a window to use the sale proceeds without the stress of timing two closings perfectly. Many agents don't ask about this, but we do.
                </p>
                <p className="component-description">
                  Lenders typically allow Post Settlement Occupancy for up to 60 days, making this a powerful negotiation tool.
                </p>
              </div>
            </div>

            <div className="offer-component-card">
              <div className="component-icon"><DollarSign size={32} /></div>
              <div className="component-content">
                <h3 className="component-title">EMD (<span className="tooltip-trigger" data-tooltip="Earnest Money Deposit: A good-faith deposit showing you're serious about buying. Held in escrow and credited back at closing.">Earnest Money Deposit</span>)</h3>
                <p className="component-description">
                  The EMD (earnest money deposit) goes into an escrow account at the title company until settlement. At closing, it's credited back to you and can be used toward your down payment or refunded.
                </p>
                <p className="component-description">
                  <strong>Market average in DFW:</strong> 1-5% of purchase price. 3% EMD is the standard. The larger the EMD, the more security the seller has that you'll move forward to settlement.
                </p>
                <p className="component-description">
                  <strong>Our strategy:</strong> If you have liquidity, a larger EMD is an easy way to make your offer stand out—at no extra cost to you. <strong>Ask me more about how we can use EMD strategically in your offer.</strong>
                </p>
              </div>
            </div>

            <div className="offer-component-card">
              <div className="component-icon"><Coins size={32} /></div>
              <div className="component-content">
                <h3 className="component-title">Down Payment</h3>
                <p className="component-description">
                  The down payment is the initial cash amount you pay toward the purchase price of the home. It's your equity stake in the property from day one.
                </p>
                <p className="component-description">
                  <strong>Minimum down payment:</strong> Typically 3% for conventional loans (though some programs allow less), and can go up to 20% or more.
                </p>
                <p className="component-description">
                  <strong>Benefits of a larger down payment:</strong> Better loan terms, lower monthly payments, and may eliminate the need for private mortgage insurance (<span className="tooltip-trigger" data-tooltip="Private Mortgage Insurance: Insurance that protects the lender if you default. Typically required when your down payment is less than 20%.">PMI</span>).
                </p>
                <p className="component-description">
                  The amount you put down will depend on your financial situation, the type of loan you're using, and your long-term financial goals. <strong>As your realtor, I'll help you understand your options and make the best decision for your situation.</strong>
                </p>
              </div>
            </div>

            <div className="offer-component-card">
              <div className="component-icon"><Building size={32} /></div>
              <div className="component-content">
                <h3 className="component-title">Lender/Title Company</h3>
                <p className="component-description">
                  <strong>The Lender</strong> provides your mortgage financing, reviews your financial documents, and approves your loan. They handle all the financial aspects of the transaction.
                </p>
                <p className="component-description">
                  <strong>The Title Company</strong> conducts a title search to ensure the property has a clear title (no liens or ownership disputes), handles the closing process, and ensures the legal transfer of ownership. They also hold your earnest money deposit in escrow.
                </p>
                <p className="component-description">
                  <strong>How They Work Together:</strong> The lender provides financing, while the title company ensures the legal transfer is clean and handles closing. They coordinate to ensure all funds are properly transferred and documents are correctly executed.
                </p>
                <p className="component-description">
                  As your realtor, I have preferred vendors for both, but we'll always confirm who you decide to work with. <strong>Ask me more about our trusted lender and title company network.</strong>
                </p>
              </div>
            </div>

            <div className="offer-component-card">
              <div className="component-icon"><Handshake size={32} /></div>
              <div className="component-content">
                <h3 className="component-title">Seller Subsidy</h3>
                <p className="component-description">
                  Seller subsidy (also called seller concessions) is money the seller agrees to pay toward your expenses. Depending on market conditions, you may be able to negotiate seller subsidy to make your offer more attractive while reducing your out-of-pocket costs.
                </p>
                <p className="component-description">
                  <strong>What Seller Subsidy Can Be Used For:</strong> <strong>Mortgage rate buy-downs</strong> (temporary like a 2-1 buydown or permanent points), <strong>closing costs</strong> (lender fees, title insurance, recording fees), <strong>repairs</strong> identified during inspection, or <strong>prepaid expenses</strong> (property taxes, insurance, HOA fees). Rate buy-downs are particularly powerful as they can significantly reduce your monthly payment.
                </p>
                <p className="component-description">
                  <strong>When It Makes Sense:</strong> Seller subsidy is most viable in markets with less competition, when a property has been on the market for a while, or when the seller is motivated. Even in competitive markets, a well-structured offer with a rate buy-down can stand out. <strong>As your realtor, I'll assess each situation to determine if seller subsidy is a viable strategy for your offer.</strong>
                </p>
              </div>
            </div>

            <div className="offer-component-card">
              <div className="component-icon"><Search size={32} /></div>
              <div className="component-content">
                <h3 className="component-title">Home Inspection <span className="tooltip-trigger" data-tooltip="Contingency: A condition in your offer that must be met for the sale to proceed. If not met, you can withdraw without penalty.">Contingency</span> & Appraisal <span className="tooltip-trigger" data-tooltip="Contingency: A condition in your offer that must be met for the sale to proceed. If not met, you can withdraw without penalty.">Contingency</span></h3>
                <p className="component-description">
                  <strong>Home Inspection Contingency:</strong> This gives you the right to have the property professionally inspected and to negotiate repairs or withdraw from the contract if major issues are found.
                </p>
                <p className="component-description">
                  The inspection typically covers structural elements, systems (HVAC, plumbing, electrical), and safety concerns. This contingency protects you from buying a home with hidden problems.
                </p>
                <p className="component-description">
                  <strong>Appraisal Contingency:</strong> This protects you if the home appraises for less than your offer price. The lender requires an appraisal to ensure the property is worth the loan amount.
                </p>
                <p className="component-description">
                  If the appraisal comes in low, you can renegotiate the price, make up the difference in cash, or walk away from the deal. This ensures you're not overpaying for the property.
                </p>
                <p className="component-description">
                  <strong>Strategy:</strong> Both contingencies are crucial protections, but shorter contingency periods can make your offer more competitive in hot markets. <strong>As your realtor, I'll help you balance protection with competitiveness.</strong>
                </p>
                <p className="component-note">
                  <strong>Bonus: Home Warranty</strong> - A home warranty provides extra protection for your investment and can save you money in case of future emergencies. It typically covers major systems and appliances, giving you peace of mind after closing.
                </p>
                <p className="component-description" style={{ marginTop: '1rem', fontStyle: 'italic', color: '#D4AF37', fontWeight: '600' }}>
                  Ask me more about home warranties and how they can protect your investment.
                </p>
              </div>
            </div>

            <div className="offer-component-card">
              <div className="component-icon"><CheckCircle size={32} /></div>
              <div className="component-content">
                <h3 className="component-title">Financing Contingency</h3>
                <p className="component-description">
                  Adding a financing contingency to your contract can cause pause for many sellers, and can make or break an offer.
                </p>
                <p className="component-description">
                  As your realtor, I'll work with your lender to get you fully approved—with all documents and credit reviewed—prior to submitting your offer.
                </p>
                <p className="component-description">
                  <strong>Strategy:</strong> If you need to add a financing contingency, the shorter the contingency period, the more compelling your offer will be. <strong>Work with me to structure the strongest offer possible.</strong>
                </p>
                <div className="component-note">
                  <strong>Note:</strong> Oftentimes, larger banks need more time to work through loan approval, as they work with several 3rd party vendors throughout the lending process. This can be detrimental in the offer process since the seller is looking for the most concrete offer and extended contingencies can make them very nervous. Additionally, the lack of speed can be extremely stressful for the purchaser as we work through the waiting game of approval. This is why we recommend using our preferred lenders. If you do not have a financing contingency and cannot qualify for the loan, your deposit is at risk, so make sure you discuss your options with your lender and your agent as you navigate this decision.
                </div>
              </div>
            </div>

            <div className="offer-component-card">
              <div className="component-icon"><Building size={32} /></div>
              <div className="component-content">
                <h3 className="component-title">HOA/Condo Association</h3>
                <p className="component-description">
                  If you're buying a condominium or a home in a community with a Homeowners Association (HOA), understanding the association and its fees is crucial to your home buying decision.
                </p>
                <p className="component-description">
                  <strong>HOA/Condo Fees:</strong> These monthly or annual fees cover shared expenses like maintenance of common areas, amenities (pools, gyms, landscaping), insurance for common areas, and reserve funds for future repairs. Fees can range from a few hundred to over a thousand dollars per month, depending on the community and amenities offered.
                </p>
                <p className="component-description">
                  <strong>Why It Matters:</strong> HOA fees directly impact your monthly housing costs and affordability. They also govern what you can and cannot do with your property through rules, regulations, and covenants. Understanding these fees and rules upfront helps you make an informed decision and avoid surprises after closing.
                </p>
                <p className="component-description">
                  <strong>Document Review Period/Contingency:</strong> When you're under contract, you have a specific period to review all HOA/Condo association documents, including bylaws, rules, financial statements, and meeting minutes. This review period is a critical contingency that allows you to understand the association's financial health, rules, and any pending special assessments.
                </p>
                <p className="component-description">
                  <strong>Review Periods by State:</strong> In Texas, you typically have <strong>3-7 days</strong> to review HOA/Condo documents when under contract, depending on your contract terms. During this time, you can review the documents and decide if you want to proceed with the purchase or withdraw from the contract. Specific review periods should be negotiated in your purchase contract.
                </p>
              </div>
            </div>
          </div>

          <div className="offer-cta-box">
            <p className="offer-cta-text">Ready to craft your winning offer? As your realtor, let's work together to discuss your strategy and create an offer that wins.</p>
            <button className="cta-button primary" onClick={scrollToContact}>
              Schedule My Free Buyer Consultation
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: KS TEAM ADVANTAGE */}
      {/* SECTION 5: KS TEAM ADVANTAGE */}
      {/* SECTION 5: KS TEAM ADVANTAGE */}
      <section id="team-advantage" className="team-advantage fade-in-section">
        <div className="container">
          <h2 className="section-title">Why Work With Me?</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">8+</div>
              <div className="stat-label">Years of Experience</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5.0</div>
              <div className="stat-label">Perfect Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">TOP 10</div>
              <div className="stat-label">Realtor on Social Media</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">DFW</div>
              <div className="stat-label">Area Expert</div>
            </div>
          </div>
          <p className="team-text">
            When you work with me as your realtor, you're working with Marisol Gallegos and eXp Realty. We have the track record,
            the resources, and the market intel to ensure you win. <strong>Let's work together to find your perfect home.</strong>
          </p>
        </div>
      </section>

      {/* SECTION 6: WELCOME TO THE FAMILY */}
      <section className="family fade-in-section">
        <div className="container">
          <h2 className="section-title">Our Relationship Doesn't End at Closing</h2>
          <p className="section-subtitle">When you work with us, you become part of our real estate family.</p>
          <div className="family-grid">
            <div className="family-card">
              <div className="family-icon"><Wrench size={48} /></div>
              <h3 className="family-title">Your Vendor Source</h3>
              <p className="family-description">
                Need a great plumber, painter, or contractor? Our trusted vendor list is now your list.
              </p>
            </div>
            <div className="family-card">
              <div className="family-icon"><PartyPopper size={48} /></div>
              <h3 className="family-title">Fun Client Events</h3>
              <p className="family-description">
                You're invited! Get exclusive invitations to our client events and networking opportunities throughout the year.
              </p>
            </div>
            <div className="family-card">
              <div className="family-icon"><Heart size={48} /></div>
              <h3 className="family-title">We Give Back Together</h3>
              <p className="family-description">
                We love the DFW area. For every referral we receive, we donate to local charities to give back to our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="faq fade-in-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Everything you need to know about buying a home in the DFW area</p>
          <div className="faq-list">
            <div className={`faq-bar ${openFaq === 0 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(0)}>
                <span>How long does the home buying process take?</span>
                <ChevronDown className={`faq-icon ${openFaq === 0 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  Typically, the home buying process takes 30-45 days from offer acceptance to closing. However, this can vary based on financing, inspections, and negotiations. As your realtor, I'll work with you to ensure a timeline that works for your situation.
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 1 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(1)}>
                <span>What credit score do I need to buy a home?</span>
                <ChevronDown className={`faq-icon ${openFaq === 1 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  Most conventional loans require a credit score of 620 or higher, while FHA loans may accept scores as low as 580 (or even 500 with a larger down payment). VA loans typically require 620+. However, higher scores get better interest rates. As your realtor, I'll connect you with trusted lenders who can review your specific situation and help improve your credit if needed. <strong>Ask me more about credit score requirements and how to improve yours.</strong>
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 2 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(2)}>
                <span>What is PMI (Private Mortgage Insurance) and when do I need it?</span>
                <ChevronDown className={`faq-icon ${openFaq === 2 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  PMI is insurance that protects the lender if you default on your loan. It's typically required when your down payment is less than 20% of the home's purchase price. PMI usually costs 0.5% to 1% of your loan amount annually and can be removed once you reach 20% equity. As your realtor, I'll help you understand your PMI options and when it makes sense to pay it. <strong>Ask me more about PMI and how to minimize or avoid it.</strong>
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 3 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(3)}>
                <span>Can I buy a home if I have student loans or other debt?</span>
                <ChevronDown className={`faq-icon ${openFaq === 3 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  Yes! Having debt doesn't automatically disqualify you. Lenders look at your debt-to-income ratio (DTI), which should typically be below 43% for most loans. As your realtor, I'll connect you with trusted lenders who can help you understand your options and find the right loan program for your situation. <strong>Ask me more about how we can work together to get you approved.</strong>
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 4 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(4)}>
                <span>Should I get a home inspection?</span>
                <ChevronDown className={`faq-icon ${openFaq === 4 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  Absolutely! A home inspection is one of the most important steps in the buying process. It reveals potential issues with the property's structure, systems (HVAC, plumbing, electrical), and safety concerns. Even in competitive markets, an inspection contingency protects you from buying a home with hidden problems. As your realtor, I'll help you find a qualified inspector and negotiate repairs if issues are found. <strong>Ask me more about home inspections and how they protect you.</strong>
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 5 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(5)}>
                <span>What happens if the home doesn't appraise for the purchase price?</span>
                <ChevronDown className={`faq-icon ${openFaq === 5 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  If the appraisal comes in lower than your offer price, you have several options: renegotiate the price with the seller, make up the difference in cash, or walk away from the deal (if you have an appraisal contingency). This is why an appraisal contingency is crucial—it protects you from overpaying. As your realtor, I'll help you navigate this situation and negotiate the best outcome. <strong>Ask me more about appraisal contingencies and how they protect you.</strong>
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 6 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(6)}>
                <span>Can I negotiate the price after the inspection?</span>
                <ChevronDown className={`faq-icon ${openFaq === 6 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  Yes! If the inspection reveals issues, you can negotiate with the seller to either lower the price, have them make repairs, or provide a credit at closing. The key is having an inspection contingency in your offer. As your realtor, I'll help you determine which issues are worth negotiating and craft a strategy that protects your interests while keeping the deal together. <strong>Ask me more about inspection negotiations.</strong>
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 7 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(7)}>
                <span>What should I look for when viewing homes?</span>
                <ChevronDown className={`faq-icon ${openFaq === 7 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  Focus on the home's condition, layout, location, and potential issues. Look for signs of water damage, foundation problems, outdated systems, and neighborhood factors (noise, traffic, schools). Don't get distracted by staging—focus on the bones of the house. As your realtor, I'll point out red flags and help you evaluate each property objectively. <strong>Ask me more about what to look for during home viewings.</strong>
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 8 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(8)}>
                <span>How many homes should I view before making an offer?</span>
                <ChevronDown className={`faq-icon ${openFaq === 8 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  There's no magic number, but most buyers view 10-15 homes before making an offer. The key is viewing enough homes to understand the market and recognize a good deal when you see it. However, in competitive markets, you may need to act quickly. As your realtor, I'll help you balance thoroughness with speed so you don't miss out on great opportunities. <strong>Let's work together to find your perfect home.</strong>
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 9 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(9)}>
                <span>What is a home warranty and do I need one?</span>
                <ChevronDown className={`faq-icon ${openFaq === 9 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  A home warranty covers repairs or replacements for major systems (HVAC, plumbing, electrical) and appliances for a set period, typically one year. It's not required, but it can provide peace of mind and save you money on unexpected repairs. Some sellers offer a home warranty as part of the sale. As your realtor, I'll help you understand if a home warranty makes sense for your situation. <strong>Ask me more about home warranties and how they can protect your investment.</strong>
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 10 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(10)}>
                <span>Are there any first time home buyer programs?</span>
                <ChevronDown className={`faq-icon ${openFaq === 10 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  Yes! There are several first-time home buyer programs available in Texas that can help with down payment assistance, lower interest rates, and reduced closing costs. These programs include options like FHA loans, VA loans (for eligible veterans), and Texas-specific programs like the Texas Department of Housing and Community Affairs (TDHCA) programs, which offer down payment assistance and competitive interest rates. As your realtor, I'll connect you with mortgage lenders who can provide detailed information about first-time home buyer programs you may qualify for. <strong>Ask me more about first-time buyer programs in Texas.</strong>
                </p>
              </div>
            </div>
            <div className={`faq-bar ${openFaq === 11 ? 'open' : ''}`}>
              <button className="faq-question-bar" onClick={() => toggleFaq(11)}>
                <span>What are the best neighborhoods for home buyers in the DFW area?</span>
                <ChevronDown className={`faq-icon ${openFaq === 11 ? 'open' : ''}`} size={20} />
              </button>
              <div className="faq-answer-content">
                <p className="faq-answer">
                  The DFW area offers excellent neighborhoods across Dallas, Collin, and surrounding counties. In Dallas & Surrounding Areas, popular areas include Dallas, Irving, Garland, Richardson, Grand Prairie, Arlington, Fort Worth, and Desoto. In Frisco, Plano & North Dallas, great options include Frisco, Plano, McKinney, Allen, Addison, Carrollton, and Lewisville. In Celina, Prosper & More, consider Celina, Prosper, Aubrey, Forney, Midlothian, and North Richland Hills. Each area has unique character, price points, and amenities. As your realtor, I'll help you find the best neighborhood that fits your budget, lifestyle, and commute needs. <strong>Let's work together to explore the best neighborhoods for you.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GLOSSARY SECTION */}
      <section id="glossary" className="glossary fade-in-section">
        <div className="container">
          <h2 className="section-title">Real Estate Glossary</h2>
          <p className="section-subtitle">Common terms you'll encounter during your home buying journey</p>
          <div className="glossary-grid">
            <div className="glossary-item">
              <h3 className="glossary-term">Appraisal</h3>
              <p className="glossary-definition">A professional assessment of a property's value conducted by a licensed appraiser. Lenders require this to ensure the property is worth the loan amount.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">Contingency</h3>
              <p className="glossary-definition">A condition in your offer that must be met for the sale to proceed. Common contingencies include inspection, appraisal, and financing. If not met, you can withdraw without penalty.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">Down Payment</h3>
              <p className="glossary-definition">The initial cash amount you pay toward the purchase price of the home. Typically 3-20% of the home price, depending on your loan type.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">EMD (Earnest Money Deposit)</h3>
              <p className="glossary-definition">A good-faith deposit showing you're serious about buying. Held in escrow and credited back at closing. Typically 1-5% of purchase price in the DFW area.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">Escrow</h3>
              <p className="glossary-definition">A neutral third party (usually a title company) that holds funds and documents until all conditions of the sale are met and closing is complete.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">Home Inspection</h3>
              <p className="glossary-definition">A professional evaluation of a property's condition, including structural elements, systems (HVAC, plumbing, electrical), and safety concerns. Protects you from hidden problems.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">PMI (Private Mortgage Insurance)</h3>
              <p className="glossary-definition">Insurance that protects the lender if you default. Typically required when your down payment is less than 20%. Can be removed once you reach 20% equity.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">Pre-Approval</h3>
              <p className="glossary-definition">A thorough qualification with document verification from a lender. This makes you a serious buyer and lets you act fast. Required to be competitive in today's market.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">Pre-Qualified</h3>
              <p className="glossary-definition">A quick estimate based on basic information you provide. Not verified by a lender. Less reliable than pre-approval.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">Seller Subsidy</h3>
              <p className="glossary-definition">Money the seller agrees to pay toward your closing costs or other expenses. Can be used for rate buy-downs, closing costs, or repairs.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">Title Insurance</h3>
              <p className="glossary-definition">Insurance that protects you and the lender from ownership disputes, liens, or other title issues. Required by lenders and protects your investment.</p>
            </div>
            <div className="glossary-item">
              <h3 className="glossary-term">Transfer Tax</h3>
              <p className="glossary-definition">A tax paid when property ownership is transferred. Texas: Generally no state transfer tax for buyers. Some local jurisdictions may have small fees, but most DFW areas do not charge transfer tax to buyers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section id="contact-section" className="contact-cta">
        <div className="container">
          <h2 className="section-title">Ready to Start Your Home Search?</h2>
          <p className="cta-quote">"All we ask from you is your loyalty. In return, you get our 100% commitment and expertise."</p>
          <p className="section-subtitle">Let's work together! Set up a 30-minute, no-obligation buyer consultation with me, your realtor. No pressure, just a great conversation about your goals and how we can find your perfect home.</p>

          {/* What's Included Section */}
          <div className="consultation-includes">
            <h3 className="includes-title">What's Included in Your Free Buyer Consultation:</h3>
            <div className="includes-content">
              <ul className="includes-list">
                <li className="includes-item">
                  <span className="includes-icon"><Target size={24} /></span>
                  <span><strong>Personalized Home Buying Roadmap & Budget Planning</strong> - A customized plan tailored to your timeline, budget, and goals, plus a complete breakdown of all costs and a realistic timeline for your home purchase</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon"><Zap size={24} /></span>
                  <span><strong>Pre-Approval Strategy</strong> - Connect with trusted lenders for 48-hour pre-approval to become a "power buyer"</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon"><BarChart3 size={24} /></span>
                  <span><strong>DFW Market Insights</strong> - Get expert analysis of current market conditions in your target neighborhoods</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon"><Key size={24} /></span>
                  <span><strong>Priority Access Preview</strong> - Learn how to access off-market homes before they hit Zillow</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon"><Trophy size={24} /></span>
                  <span><strong>Winning Offer Strategy</strong> - Discover proven tactics to craft offers that stand out in competitive markets</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon"><Handshake size={24} /></span>
                  <span><strong>Professional Network</strong> - Access to our network of trusted lenders, inspectors, and vendors</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon"><MessageCircle size={24} /></span>
                  <span><strong>All Your Real Estate Questions Answered</strong> - Get expert answers to any questions you have about buying a home, the DFW market, neighborhoods, financing, or the home buying process</span>
                </li>
              </ul>
            </div>
          </div>

          <form
            name="contact"
            method="POST"
            className={`contact-form ${formSubmitted ? 'submitted' : ''}`}
            onSubmit={handleSubmit}
          >
            {/* Honeypot field for spam protection */}
            <p style={{ display: 'none' }}>
              <label>
                Don't fill this out if you're human: <input name="bot-field" />
              </label>
            </p>

            <div className="form-header">
              <h3 className="form-title">Get Your Free Consultation</h3>
              <p className="form-subtitle">Fill out the form below and we'll get back to you within 24 hours</p>
              <p className="form-required-note">All fields marked with <span className="required-asterisk">*</span> are required</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  What’s your fullname? <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  What’s a good number? <span className="required-asterisk">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${formErrors.phone ? 'error' : ''}`}
                />
                {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  What’s a good email? <span className="required-asterisk">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="locations" className="form-label">
                  Open to locations in and around SA <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  id="locations"
                  name="locations"
                  placeholder="e.g. San Antonio, Boerne, etc."
                  value={formData.locations}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${formErrors.locations ? 'error' : ''}`}
                />
                {formErrors.locations && <span className="error-message">{formErrors.locations}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="timeline" className="form-label">
                  How soon are you looking to move? <span className="required-asterisk">*</span>
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  required
                  className={`form-input form-select ${formErrors.timeline ? 'error' : ''}`}
                >
                  <option value="">Select your timeline</option>
                  <option value="1-3">1-3 months</option>
                  <option value="3-6">3-6 Months</option>
                  <option value="6+">6 Months+</option>
                </select>
                {formErrors.timeline && <span className="error-message">{formErrors.timeline}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="creditScore" className="form-label">
                  What is your credit score? <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  id="creditScore"
                  name="creditScore"
                  placeholder="e.g. 720"
                  value={formData.creditScore}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${formErrors.creditScore ? 'error' : ''}`}
                />
                {formErrors.creditScore && <span className="error-message">{formErrors.creditScore}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="married" className="form-label">
                  Are you legally married? <span className="required-asterisk">*</span>
                </label>
                <select
                  id="married"
                  name="married"
                  value={formData.married}
                  onChange={handleInputChange}
                  required
                  className={`form-input form-select ${formErrors.married ? 'error' : ''}`}
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {formErrors.married && <span className="error-message">{formErrors.married}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="downPaymentSaved" className="form-label">
                  How much have you saved for downpayment? <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  id="downPaymentSaved"
                  name="downPaymentSaved"
                  placeholder="e.g. $20,000"
                  value={formData.downPaymentSaved}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${formErrors.downPaymentSaved ? 'error' : ''}`}
                />
                {formErrors.downPaymentSaved && <span className="error-message">{formErrors.downPaymentSaved}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="assistanceNeeded" className="form-label">
                  Do you need down payment assistance? <span className="required-asterisk">*</span>
                </label>
                <select
                  id="assistanceNeeded"
                  name="assistanceNeeded"
                  value={formData.assistanceNeeded}
                  onChange={handleInputChange}
                  required
                  className={`form-input form-select ${formErrors.assistanceNeeded ? 'error' : ''}`}
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {formErrors.assistanceNeeded && <span className="error-message">{formErrors.assistanceNeeded}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="totalIncome" className="form-label">
                  What's your total income? <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  id="totalIncome"
                  name="totalIncome"
                  placeholder="e.g. $80,000/year"
                  value={formData.totalIncome}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${formErrors.totalIncome ? 'error' : ''}`}
                />
                {formErrors.totalIncome && <span className="error-message">{formErrors.totalIncome}</span>}
              </div>
            </div>
            <button type="submit" className={`cta-button primary large ${formSubmitted ? 'submitting' : ''}`} disabled={formSubmitted}>
              {formSubmitted ? 'Submitting...' : 'Schedule My Free Consultation'}
            </button>
            <p className="form-privacy">We respect your privacy. Your information will never be shared.</p>
          </form>

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="success-modal-overlay" onClick={closeSuccessModal}>
              <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                <div className="success-icon"><CheckCircle size={48} /></div>
                <h3>Thank You!</h3>
                <p>We've received your information and will be in touch soon to schedule your buyer consultation.</p>
                <button className="cta-button primary" onClick={closeSuccessModal}>Got It!</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FLOATING CTA BUTTON */}
      {isScrolled && (
        <button className="floating-cta" onClick={scrollToContact} aria-label="Get Started">
          <span>Get Your Free Consultation</span>
        </button>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <p className="footer-name">Samantha Martinez | Realtor®</p>
              <p className="footer-license">San Antonio, Houston, Dallas, Texas</p>
              <div className="footer-contact">
                <a href="mailto:samanthardrealty@gmail.com" className="footer-email">samanthardrealty@gmail.com</a>
                <a href="tel:+12107605293" className="footer-phone">+1 (210) 760-5293</a>
              </div>
            </div>
            <div className="footer-logos">
              <div className="logo-placeholder">Real Broker</div>
            </div>
            <p className="footer-eho">Equal Housing Opportunity</p>
          </div>
        </div>
      </footer>

      {/* PHOTO MODAL */}
      {showPhotoModal && (
        <div
          className="photo-modal-overlay"
          onClick={() => setShowPhotoModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-modal-title"
        >
          <div
            className="photo-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/images/samantha-profile-4.png"
              alt="Samantha Martinez - Real Estate Agent"
              className="photo-modal-image"
              loading="lazy"
            />
            <button
              onClick={() => setShowPhotoModal(false)}
              className="photo-modal-close"
              aria-label="Close photo"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ArrowUp size={48} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

export default App
