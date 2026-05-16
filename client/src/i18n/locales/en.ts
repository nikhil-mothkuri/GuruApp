// NOTE: This is the source-of-truth locale. All keys here must exist in hi.ts and te.ts.
const en = {
  // ── Navigation ──────────────────────────────────────────────────────────────
  nav: {
    findGurus: 'Find Gurus',
    shop: 'Shop',
    guruDashboard: 'Guru Dashboard',
    myShop: 'My Shop',
    myBookings: 'My Bookings',
    admin: 'Admin',
    signOut: 'Sign out',
    signIn: 'Sign in',
    getStarted: 'Get started',
  },

  // ── Language picker ──────────────────────────────────────────────────────────
  lang: {
    en: 'EN',
    hi: 'हि',
    te: 'తె',
  },

  // ── Landing page ────────────────────────────────────────────────────────────
  landing: {
    hero: {
      title: "India's marketplace for Gurus, learners & digital skill growth",
      subtitle:
        'Discover trusted experts, launch your teaching profile, and build a business with tools made for the Indian learning economy.',
    },
    search: {
      guruPlaceholder: 'Guru name…',
      skillPlaceholder: 'Skill…',
      button: 'Search Gurus',
      labelGuru: 'Guru',
      labelSkill: 'Skill',
    },
    discover: {
      title: 'Discover verified Gurus today',
      subtitle: 'Explore available experts and filter by skill, profile, and teaching style.',
      searchResults: 'Search results for "{{query}}"',
      noGurus:
        'No gurus found yet. Try a broader skill or leave the search blank to browse all profiles.',
    },
    why: {
      title: 'Why sign up for SakshamBharat',
      subtitle: 'Join a community built for discovery, mentorship, and income growth.',
      flexible: {
        label: 'Flexible learning',
        title: 'Learn on your schedule',
        body: 'Choose one-time sessions, subscriptions, and digital offerings from Gurus across India.',
      },
      earn: {
        label: 'Earn more',
        title: 'Grow your income',
        body: 'Publish your skills, manage bookings, and reach learners who want exactly what you teach.',
      },
      trusted: {
        label: 'Trusted discovery',
        title: 'Find the right mentor',
        body: 'Filter by skill, browse ratings, and pick Gurus with proven success stories.',
      },
    },
    stories: {
      title: 'Success stories from our community',
      subtitle: 'Real users are building skills, scaling businesses, and teaching with purpose.',
      guru: {
        label: 'Guru story',
        title: 'From side gig to teaching full time',
        body: '"I booked 12 sessions in the first month and my online coaching became a dependable income stream."',
        author: '— Priya, Career Coach',
      },
      learner: {
        label: 'Learner win',
        title: 'Built confidence with expert mentoring',
        body: '"I completed my first UI design assignment in four weeks with guidance from a mentor on the platform."',
        author: '— Akshay, Product Designer',
      },
      impact: {
        label: 'Impact',
        title: 'Turning skills into opportunities',
        body: '"My culinary workshop sold out in days, and I reached learners who valued Indian craftsmanship."',
        author: '— Meeta, Culinary Trainer',
      },
    },
    roadmap: {
      title: 'What we are building next',
      subtitle:
        'Ongoing improvements and incentives that make the platform stronger for both Gurus and students.',
      work: {
        title: 'Ongoing product work',
        item1: 'Verified Guru badges and curated skill categories.',
        item2: 'Subscription plans, booking calendar, and progress tools.',
        item3: 'Better discovery, earnings analytics, and community feedback loops.',
      },
      why: {
        title: 'Why it matters',
        body: 'We are creating a modern digital space where local expertise is easy to find, customers can trust their mentor, and creators can build repeatable revenue.',
        item1: 'Early adopters get priority access to new Guru tools.',
        item2: 'Referral incentives help Gurus grow with community support.',
        item3: 'Learners get more choice as the marketplace earns trust.',
      },
    },
    footer: {
      copyright: '© {{year}} SakshamBharat',
      getStarted: 'Get started',
      signIn: 'Sign in',
      shop: 'Shop',
    },
  },

  // ── Auth ─────────────────────────────────────────────────────────────────────
  login: {
    title: 'Sign in',
    subtitle: 'Access your SakshamBharat workspace to teach and sell.',
    email: 'Email',
    password: 'Password',
    createAccount: 'Create account',
    signingIn: 'Signing in…',
    next: 'Next',
    or: 'or',
    failed: 'Sign in failed',
  },

  signup: {
    title: 'Create your account',
    subtitle: 'Join SakshamBharat to learn, sell, and grow.',
    fullName: 'Full name',
    email: 'Email',
    password: 'Password',
    joinAs: 'I want to join as',
    student: 'Student',
    guru: 'Guru',
    bothNote: 'You can be both a Guru and a Student.',
    signInInstead: 'Sign in instead',
    creating: 'Creating…',
    next: 'Next',
    or: 'or',
    failed: 'Sign up failed',
  },

  // ── Student dashboard ────────────────────────────────────────────────────────
  student: {
    badge: 'Student',
    stats: {
      totalBookings: 'Total Bookings',
      completed: 'Completed',
      favourites: 'Favourites',
    },
    tabs: {
      bookings: 'My Bookings',
      favourites: 'Favourites',
    },
    bookings: {
      emptyTitle: 'No bookings yet',
      emptySubtitle: 'Find a guru to get started on your learning journey.',
      emptyCta: 'Browse Gurus',
      cancel: 'Cancel',
      rate: 'Rate',
    },
    favourites: {
      emptyTitle: 'No favourites yet',
      emptySubtitle: 'Browse gurus and save the ones you love.',
    },
    rating: {
      title: 'Rate your session',
      placeholder: 'Share your experience (optional)',
      cancel: 'Cancel',
      submit: 'Submit',
      submitting: 'Submitting…',
    },
  },

  // ── Booking modal ────────────────────────────────────────────────────────────
  booking: {
    title: 'Book with {{guruName}}',
    sessionType: 'Session type',
    oneTime: 'One-time',
    recurring: 'Recurring',
    recurringLabel: 'Recurring daily sessions',
    sessionDate: 'Session date',
    mustBe: '— must be a {{day}}',
    dayMismatch: 'That date is a {{actual}}. Please pick a {{expected}}.',
    startDate: 'Start date',
    subscribeUntil: 'Subscribe until',
    cancel: 'Cancel',
    confirm: 'Confirm',
    booking: 'Booking…',
    failed: 'Booking failed',
  },

  // ── Day names (0 = Sunday) ───────────────────────────────────────────────────
  days: {
    '0': 'Sunday',
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
  },

  // ── Booking / session statuses ───────────────────────────────────────────────
  status: {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },

  // ── Shop ─────────────────────────────────────────────────────────────────────
  shop: {
    title: 'SakshamBharat Shop',
    subtitle: 'Discover products, courses, and digital resources from expert gurus across India.',
    searchPlaceholder: 'Search products...',
    searchButton: 'Search',
    loading: 'Loading…',
    productCount_one: '1 product',
    productCount_other: '{{count}} products',
    noProductsTitle: 'No products found',
    noProductsSubtitle: 'Try adjusting your search or filters',
    sortLabel: 'Sort:',
    sort: {
      newest: 'Newest',
      popular: 'Most Popular',
      priceAsc: 'Price: Low to High',
      priceDesc: 'Price: High to Low',
    },
    filter: {
      category: 'Category',
      allCategories: 'All categories',
      type: 'Type',
      allTypes: 'All types',
      physical: 'Physical',
      digital: 'Digital',
      minPrice: 'Min price',
      maxPrice: 'Max price',
      clearAll: 'Clear all filters',
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      page: 'Page {{page}} of {{total}}',
    },
  },

  // ── Product detail ────────────────────────────────────────────────────────────
  product: {
    backToShop: 'Back to Shop',
    notFound: 'Product not found.',
    backToShopLink: 'Back to Shop',
    digitalDownload: 'Digital download',
    save: 'Save {{pct}}%',
    outOfStock: 'Out of Stock',
    buyNow: 'Buy Now',
    weight: 'Weight: {{weight}} {{unit}}',
    dimensions: 'Dimensions: {{l}}×{{w}}×{{h}} {{unit}}',
    sku: 'SKU: {{sku}}',
    details: {
      title: 'Product details',
      subtitle: 'Everything you need to know before placing your order.',
    },
    by: 'by {{name}}',
    orderPlaced: 'Order placed! ID: {{id}}',
  },

  // ── Order modal ───────────────────────────────────────────────────────────────
  order: {
    title: 'Place Order',
    qty: 'Qty: {{qty}}',
    quantity: 'Quantity',
    fullName: 'Full name *',
    email: 'Email *',
    phone: 'Phone',
    shippingAddress: 'Shipping address',
    street: 'Street address',
    city: 'City',
    state: 'State / Province',
    country: 'Country',
    zip: 'ZIP / Postal code',
    notes: 'Order notes',
    notesPlaceholder: 'Any special requests…',
    error: 'Something went wrong',
    placing: 'Placing order…',
    confirm: 'Confirm Order',
  },

  // ── Guru profile (public view) ────────────────────────────────────────────────
  guruProfile: {
    backToSearch: 'Back to search',
    reviews: '{{avg}} · {{count}} reviews',
    saved: 'Saved',
    save: 'Save',
    photos: 'Photos',
    videos: 'Videos',
    reviews_section: 'Reviews',
    anonymous: 'Anonymous',
    availability: 'Availability',
    recurringSessions: 'Recurring sessions',
    recurringSubtitle: 'Daily sessions for a time period',
    subscribe: 'Subscribe',
    noSlots: 'No appointment slots available yet.',
    oneTimeAppointments: 'One-time appointments',
    everyDay: 'Every {{day}}',
    book: 'Book',
    signIn: 'Sign in',
    notFound: 'Guru not found.',
  },

  // ── Guru dashboard ────────────────────────────────────────────────────────────
  guru: {
    badge: 'Guru',
    stats: {
      totalBookings: 'Total Bookings',
      avgRating: 'Avg Rating',
      activeSlots: 'Active Slots',
    },
    tabs: {
      profile: 'My Profile',
      availability: 'Availability',
      bookings: 'Bookings',
    },
    profile: {
      tagline: 'Tagline',
      taglinePlaceholder: 'A short tagline about what you teach…',
      save: 'Save',
      skills: 'Skills',
      noSkills: 'No skills added yet.',
      addSkillPlaceholder: 'Add a skill…',
      add: 'Add',
      videos: 'YouTube Videos',
      noVideos: 'No videos added yet.',
      videoUrlPlaceholder: 'YouTube URL',
      videoTitlePlaceholder: 'Video title',
      addVideo: 'Add video',
      photos: 'Photos',
      upload: 'Upload',
    },
    availability: {
      howTitle: 'How availability works',
      howBody:
        'Add slots to let students book one-time appointments with you on specific dates. Each slot defines a recurring weekly window — for example, "every Monday 10:00–11:00" means students can pick any upcoming Monday to book a 60-minute session with you. Students can also book recurring daily sessions directly from your profile without needing a slot.',
      addSlot: 'Add a new slot',
      dayOfWeek: 'Day of week',
      startTime: 'Start time',
      endTime: 'End time',
      sessionDuration: 'Session duration',
      adding: 'Adding…',
      addSlotBtn: 'Add slot',
      slotError: 'Failed to create slot',
      yourSlots: 'Your slots',
      noSlots:
        'No slots yet. Add your first slot above so students can book appointments with you.',
      everyDay: 'Every {{day}}',
      remove: 'Remove',
    },
    bookings: {
      emptyTitle: 'No bookings yet',
      emptySubtitle: 'Students will appear here once they book a session with you.',
    },
  },

  // ── Admin panel ───────────────────────────────────────────────────────────────
  admin: {
    title: 'Admin Panel',
    metrics: {
      totalUsers: 'Total Users',
      totalBookings: 'Total Bookings',
      totalRatings: 'Total Ratings',
      activeGurus: 'Active Gurus',
    },
    table: {
      users: 'Users',
      name: 'Name',
      email: 'Email',
      guru: 'Guru',
      student: 'Student',
      active: 'Active',
      actions: 'Actions',
      ban: 'Ban',
      unban: 'Unban',
    },
  },

  // ── Common ────────────────────────────────────────────────────────────────────
  common: {
    loading: 'Loading…',
    error: 'Something went wrong',
  },
};

export default en;

// DeepString replaces all leaf string literals with `string` so sibling locales
// can hold their own translated values while still being structurally checked.
type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Translations = DeepString<typeof en>;
