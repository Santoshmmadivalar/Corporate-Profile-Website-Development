import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Category } from '../models/Category';
import { Service } from '../models/Service';
import { Project } from '../models/Project';
import { Testimonial } from '../models/Testimonial';
import { TeamMember } from '../models/Team';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { Blog } from '../models/Blog';
import { GalleryItem } from '../models/GalleryItem';
import { FAQ } from '../models/FAQ';

dotenv.config();

const seedDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/outpro';
    await mongoose.connect(mongoURI);
    console.log('Connected to database for seeding...');

    // Clear existing data
    await Category.deleteMany({});
    await Service.deleteMany({});
    await Project.deleteMany({});
    await Testimonial.deleteMany({});
    await TeamMember.deleteMany({});
    await User.deleteMany({});
    await Job.deleteMany({});
    await Blog.deleteMany({});
    await GalleryItem.deleteMany({});
    await FAQ.deleteMany({});

    console.log('Cleared existing collections.');

    // 1. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Software Engineering', slug: 'software-engineering' },
      { name: 'UI/UX Design', slug: 'ui-ux-design' },
      { name: 'Cloud & DevOps', slug: 'cloud-devops' },
      { name: 'AI & Data Analytics', slug: 'ai-data' }
    ]);
    console.log('Seeded categories.');

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat._id as mongoose.Types.ObjectId;
      return acc;
    }, {} as Record<string, mongoose.Types.ObjectId>);

    // 2. Seed Services
    const servicesData = [
      {
        name: 'Custom Software Development',
        slug: 'custom-software-development',
        icon: 'Code',
        shortDesc: 'End-to-end custom software solutions built with scalable microservices and robust API-first architecture.',
        longDesc: 'Our custom software development service addresses your specific business complexities with tailored software designs. We move away from generic off-the-shelf software to build bespoke solutions that integrate with your legacy workflows and drive operational efficiency.',
        features: [
          'Microservices & API-First Architecture',
          'Enterprise Integration Patterns',
          'High Performance & Scalable Codebases',
          'Real-time Data Processing'
        ],
        benefits: [
          'Accelerated time-to-market using modular structures',
          'Reduced licensing and overhead costs',
          'Complete ownership of intellectual property',
          'Enhanced operational security and compliance'
        ],
        techStack: ['Node.js', 'TypeScript', 'Go', 'Python', 'Docker', 'Kubernetes', 'GraphQL'],
        faqs: [
          {
            question: 'How do you ensure the security of custom software?',
            answer: 'We follow OWASP Top 10 security standards, perform regular static and dynamic code analyses (SAST/DAST), and implement RBAC and OAuth2 protocols.'
          },
          {
            question: 'Can you integrate the custom software with our existing ERP/CRM?',
            answer: 'Yes, we design custom API adaptors and use middleware integrations to ensure seamless data flow between legacy systems and new applications.'
          }
        ]
      },
      {
        name: 'Web & E-Commerce Development',
        slug: 'web-ecommerce-development',
        icon: 'Globe',
        shortDesc: 'High-speed headless commerce platforms and modern Jamstack web applications built for conversion.',
        longDesc: 'We construct next-generation web platforms that engage users. Leveraging modern frontend architectures like Next.js and secure headless checkout integrations, we achieve high-performance shopping experiences and landing pages.',
        features: [
          'Headless Commerce & Dynamic Checkout',
          'Server-Side Rendering & Static Generation',
          'Progressive Web Apps (PWAs)',
          'SEO & Performance Optimization'
        ],
        benefits: [
          'Sub-2 second load times yielding higher search rankings',
          'Increase in sales conversions with optimized user checkouts',
          'Multi-channel inventory and order orchestration',
          'Highly customizable and modular design control'
        ],
        techStack: ['Next.js', 'React', 'Tailwind CSS', 'Shopify Hydrogen', 'Stripe', 'Node.js', 'Sanity.io'],
        faqs: [
          {
            question: 'What is headless commerce, and why should we use it?',
            answer: 'Headless commerce decouples the frontend presentation layer from the backend commerce engine. This enables faster page speeds, endless design customization, and seamless omni-channel integration.'
          }
        ]
      },
      {
        name: 'UI/UX Design & Brand Strategy',
        slug: 'ui-ux-design',
        icon: 'Framer',
        shortDesc: 'Aesthetic, user-centric interfaces and identity design that builds user trust and boosts product engagement.',
        longDesc: 'Design is not just how it looks, but how it works. We combine qualitative user research with interactive prototyping and branding principles to create digital products that feel premium, modern, and effortless to navigate.',
        features: [
          'Interactive Wireframing & Prototyping',
          'Comprehensive Design Systems (Figma)',
          'Quantitative Usability Testing',
          'Corporate Brand Identity Design'
        ],
        benefits: [
          'Reduced drop-off rates through intuitive user flows',
          'Cohesive brand messaging across all digital touchpoints',
          'Higher user satisfaction and NPS ratings',
          'Faster frontend production using pre-built design systems'
        ],
        techStack: ['Figma', 'Adobe Creative Cloud', 'Miro', 'Lottie', 'Storybook'],
        faqs: [
          {
            question: 'What is your UX research process?',
            answer: 'We conduct user interviews, map user journeys, run competitive audits, and build interactive wireframes which are iteratively tested with target audiences.'
          }
        ]
      },
      {
        name: 'Cloud Solutions & DevOps',
        slug: 'cloud-devops',
        icon: 'Cloud',
        shortDesc: 'Enterprise cloud migrations, automated CI/CD pipelines, and cost-effective infrastructure management.',
        longDesc: 'Empower your engineering teams with continuous deployment pipelines and cloud systems. We migrate workload infrastructures to AWS or Azure and enforce Infrastructure as Code (IaC) to eliminate manual errors and improve reliability.',
        features: [
          'Infrastructure as Code (Terraform)',
          'Continuous Integration & Deployment (CI/CD)',
          'Serverless & Container Orchestration',
          'Cloud Cost Optimization'
        ],
        benefits: [
          'Zero-downtime deployment pipelines',
          'Up to 40% reduction in cloud infrastructure spending',
          'Elastic scaling to handle sudden traffic peaks',
          'Automated disaster recovery and backup orchestration'
        ],
        techStack: ['AWS', 'Microsoft Azure', 'Terraform', 'GitHub Actions', 'Docker', 'Kubernetes', 'Prometheus'],
        faqs: [
          {
            question: 'How do you optimize cloud costs?',
            answer: 'We run audits to identify idle resources, set up auto-scaling policies, migrate standard workloads to serverless structures, and utilize spot instances for dev environments.'
          }
        ]
      }
    ];

    await Service.insertMany(servicesData);
    console.log('Seeded services.');

    // 3. Seed Projects (Portfolio)
    const projectsData = [
      {
        title: 'FinStream: Enterprise Banking System Redesign',
        slug: 'finstream-banking-redesign',
        category: categoryMap['ui-ux-design'],
        description: 'A complete modernization of an international banking system frontend and middleware, improving client transaction speeds.',
        images: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
        ],
        challenge: 'The client had a legacy banking dashboard developed in 2012. It was slow, hard to use, and suffered a high abandonment rate during international wires due to complex validation forms and slow API response times of over 6 seconds.',
        solution: 'We re-architected the client dashboard using Next.js 14 and created a modular Express middleware layer that caches frequent queries. We redesigned the wire transfer process into a simple 3-step wizard with real-time currency conversion APIs and clear UI feedback.',
        kpis: [
          { label: 'Transaction Completion Rate', value: '+48%' },
          { label: 'Average Load Time', value: '0.8s' },
          { label: 'User Rating', value: '4.9/5' }
        ],
        clientFeedback: {
          rating: 5,
          comment: 'Outpro.India completely turned our portal around. The speed and user feedback have driven immediate engagement from our corporate clients.',
          reviewerName: 'Aravind Sharma',
          reviewerRole: 'Chief Product Officer, FinStream Ltd.'
        },
        technologies: ['React', 'Next.js', 'Express', 'Tailwind CSS', 'Redis', 'TypeScript'],
        clientName: 'FinStream Ltd.'
      },
      {
        title: 'ShopVibe: Headless B2B Commerce Platform',
        slug: 'shopvibe-b2b-commerce',
        category: categoryMap['software-engineering'],
        description: 'Building a high-throughput, headless commerce network connecting manufacturers with local distributors.',
        images: [
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80'
        ],
        challenge: 'A manufacturing client needed to digitize wholesale distributor accounts. Standard e-commerce templates failed to support dynamic discount pricing models, bulk-order catalogs, and real-time inventory synchronization with SAP.',
        solution: 'We engineered a bespoke headless web app utilizing Node.js microservices. We integrated direct database views with SAP and added elastic search indexes to query over 100,000 SKUs instantly.',
        kpis: [
          { label: 'Order Processing Velocity', value: '10x Faster' },
          { label: 'Mobile Order Growth', value: '+72%' },
          { label: 'Cart Abandonment Rate', value: '-30%' }
        ],
        clientFeedback: {
          rating: 5,
          comment: 'Outpro delivered an enterprise solution that handled our wholesale logic with precision. Our business partners love the speed and interface.',
          reviewerName: 'Meera Deshmukh',
          reviewerRole: 'VP of Digital Commerce, ShopVibe Inc.'
        },
        technologies: ['Node.js', 'MongoDB', 'Go', 'GraphQL', 'Next.js', 'Docker'],
        clientName: 'ShopVibe Inc.'
      },
      {
        title: 'AeroLogix: Cloud AI Predictive Fleet Management',
        slug: 'aerologix-predictive-fleet',
        category: categoryMap['cloud-devops'],
        description: 'Implementing AWS cloud infrastructure and data pipelines for logistics fleet maintenance prediction.',
        images: [
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
        ],
        challenge: 'A logistics firm faced massive losses due to unexpected cargo vehicle downtime. Telematics data streams were massive (millions of data points daily) but unutilized due to standard database lockups.',
        solution: 'We constructed an AWS serverless data lake utilizing Kinesis, Lambda, and DynamoDB. An automated pipeline processes telemetry data, feeding predictive maintenance models that flag engine health anomalies.',
        kpis: [
          { label: 'Unplanned Downtime Reduction', value: '35%' },
          { label: 'Infrastructure Cost Saved', value: '45%' },
          { label: 'Prediction Accuracy', value: '94.2%' }
        ],
        clientFeedback: {
          rating: 5,
          comment: 'The data pipelines and alerts have prevented multiple on-road failures. Outpro’s DevOps expertise was critical in keeping costs down.',
          reviewerName: 'Robert Vance',
          reviewerRole: 'Director of Fleet Operations, AeroLogix Logistics'
        },
        technologies: ['AWS Kinesis', 'AWS Lambda', 'Terraform', 'Python', 'DynamoDB'],
        clientName: 'AeroLogix Logistics'
      }
    ];

    await Project.insertMany(projectsData);
    console.log('Seeded projects.');

    // 4. Seed Testimonials
    const testimonialsData = [
      {
        clientName: 'Vikram Mehta',
        role: 'Founder & CEO',
        company: 'EduKite Learning',
        text: 'The team at Outpro.India delivered our mobile learning platform weeks ahead of schedule. Their attention to UX layouts, responsive details, and clean React code was top-notch.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
      },
      {
        clientName: 'Sarah Jenkins',
        role: 'Technical Director',
        company: 'Vanguard Realty',
        text: 'Moving our listings portal to Next.js with Outpro was an excellent decision. Our site load speeds dropped from 5 seconds to under 1.5 seconds, immediately increasing lead generation forms.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80'
      },
      {
        clientName: 'Rajesh Nair',
        role: 'VP of Technology',
        company: 'FinArc Systems',
        text: 'Their consulting and cloud migration was highly professional. They set up Terraform IAC pipelines that reduced our AWS bills by 40% while raising application reliability.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
      }
    ];

    await Testimonial.insertMany(testimonialsData);
    console.log('Seeded testimonials.');

    // 5. Seed Team Members
    const teamData = [
      {
        name: 'Siddharth Sen',
        role: 'Chief Executive Officer & Founder',
        bio: 'Over 15 years leading enterprise solutions and IT consulting across APAC. Dedicated to scaling digital-first operations.',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80',
        socials: {
          linkedin: 'https://linkedin.com/in/siddharth-sen',
          twitter: 'https://twitter.com/siddharthsen'
        },
        order: 1
      },
      {
        name: 'Dr. Ananya Roy',
        role: 'Chief Technology Officer',
        bio: 'PhD in Distributed Systems. Former Senior Architect at tech giants. Expert in secure microservices and ML operations.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
        socials: {
          linkedin: 'https://linkedin.com/in/ananya-roy',
          github: 'https://github.com/ananyaroy-tech'
        },
        order: 2
      },
      {
        name: 'Kabir Malhotra',
        role: 'Head of Design & UX Strategy',
        bio: 'Award-winning product designer. Passionate about sleek interfaces, micro-animations, and clean, accessible brand aesthetics.',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
        socials: {
          linkedin: 'https://linkedin.com/in/kabir-malhotra',
          twitter: 'https://twitter.com/kabirdesign'
        },
        order: 3
      },
      {
        name: 'Priyanka Joshi',
        role: 'Director of Cloud & DevOps Engineering',
        bio: 'AWS Certified Solutions Architect Professional. Specialist in Kubernetes clusters, Terraform scripts, and secure deployments.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80',
        socials: {
          linkedin: 'https://linkedin.com/in/priyanka-joshi',
          github: 'https://github.com/priyanka-cloud'
        },
        order: 4
      }
    ];

    await TeamMember.insertMany(teamData);
    console.log('Seeded team members.');

    // 6. Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await User.insertMany([
      {
        name: 'Siddharth Sen',
        email: 'admin@outpro.india',
        password: hashedPassword,
        role: 'admin',
        title: 'CEO & Founder',
        department: 'Executive'
      },
      {
        name: 'Kabir Malhotra',
        email: 'employee@outpro.india',
        password: hashedPassword,
        role: 'employee',
        title: 'Head of Design',
        department: 'Design'
      },
      {
        name: 'Sarah Jenkins',
        email: 'client@outpro.india',
        password: hashedPassword,
        role: 'client',
        companyName: 'Vanguard Realty'
      },
      {
        name: 'John Doe',
        email: 'candidate@outpro.india',
        password: hashedPassword,
        role: 'candidate'
      },
      {
        name: 'Jane Smith',
        email: 'user@outpro.india',
        password: hashedPassword,
        role: 'user'
      }
    ]);
    console.log('Seeded users.');

    // 7. Seed Jobs
    await Job.insertMany([
      {
        title: 'Senior Frontend Engineer (React/Next.js)',
        department: 'Engineering',
        location: 'Kolkata, West Bengal (Hybrid)',
        description: 'We are looking for a Senior Frontend Engineer to build premium, high-performance web systems and Jamstack headless storefronts.',
        requirements: [
          '3+ years professional experience with React & Next.js',
          'Deep understanding of TypeScript & state management engines',
          'Experience building responsive, fluid user layouts with Tailwind CSS',
          'Familiarity with performance optimization tools (Lighthouse, Core Web Vitals)'
        ],
        salaryRange: '₹12,00,000 - ₹18,0,000 per annum',
        status: 'open'
      },
      {
        title: 'Backend Developer (Node.js/MongoDB)',
        department: 'Engineering',
        location: 'Remote, India',
        description: 'Join our backend engineering crew to construct high-throughput REST APIs, serverless cloud endpoints, and database architectures.',
        requirements: [
          'Proven experience with Node.js, Express, and Mongoose/MongoDB',
          'Good grip on building secure REST/GraphQL API systems',
          'Familiarity with Docker containers and CI/CD automation',
          'Knowledge of caching systems (Redis) is a plus'
        ],
        salaryRange: '₹8,00,000 - ₹14,0,000 per annum',
        status: 'open'
      }
    ]);
    console.log('Seeded jobs.');

    // 8. Seed Blogs
    await Blog.insertMany([
      {
        title: 'Migrating Legacy Monoliths to Next.js & Serverless Microservices',
        slug: 'migrating-monoliths-to-nextjs',
        summary: 'A step-by-step architectural breakdown of decanting complex legacy content hubs into performant serverless nodes.',
        content: `Decoupling a monolithic architecture requires structured phase decants. At Outpro.India, we analyze the data flow before breaking any services apart.
        
        1. **Identify the Boundaries**: Group models and controllers by domain contexts.
        2. **API-First Decoupling**: Wrap the monolithic controllers in REST interfaces.
        3. **Deploy Next.js Incremental Ingestion**: Direct static routes to Next.js static generation pipelines.
        4. **Continuous Synchronization**: Build pub-sub triggers using queue systems to verify consistency.`,
        author: 'Aravind Swaminathan',
        category: 'Architecture',
        tags: ['NextJS', 'Cloud', 'Serverless'],
        image: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&w=800&q=80',
        likes: 24,
        views: 140,
        comments: [
          { authorName: 'Sanjay Deshmukh', text: 'This was extremely helpful for our cloud migration plan.', date: '2026-07-11T12:00:00.000Z' }
        ]
      },
      {
        title: 'The Rise of Headless Commerce in B2B Corporate Operations',
        slug: 'rise-of-headless-commerce-b2b',
        summary: 'How decoupled API-first architectures enable massive scale, secure checkouts, and premium user experience dashboards.',
        content: `Headless B2B Commerce provides substantial conversion increments by separating the shopping interface from order management backend logs.
        
        Why transition to decoupled storefronts?
        - **Speed**: Optimized edge delivery translates to instant page loads.
        - **Omnichannel flexibility**: Deploy the same API interfaces to iOS, web portals, and IoT checkouts.
        - **Security**: Database nodes remain hidden behind edge caching endpoints, preventing query injection attempts.`,
        author: 'Neha Roy',
        category: 'E-Commerce',
        tags: ['APIs', 'Headless', 'Decoupled'],
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        likes: 18,
        views: 95,
        comments: []
      }
    ]);
    console.log('Seeded blogs.');

    // 9. Seed GalleryItems
    await GalleryItem.insertMany([
      {
        title: 'Outpro India Kolkata Office Workspace',
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnMSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzFlMjkzYiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBmMTcyYSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2cxKSIvPjxjaXJjbGUgY3g9IjQwMCIgY3k9IjMwMCIgcj0iMTIwIiBmaWxsPSIjMzhiZGY4IiBvcGFjaXR5PSIwLjEiLz48cGF0aCBkPSJNIDMwMCAyNTAgTCA1MDAgMjUwIEwgNDAwIDQ1MCBaIiBmaWxsPSIjMzhiZGY4IiBvcGFjaXR5PSIwLjIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZjhmYWZjIj5PdXRwcm8gSW5kaWEgV29ya3NwYWNlPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNTclIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiI+U2VjdG9yIFYsIFNhbHQgTGFrZSwgS29sa2F0YSwgSW5kaWE8L3RleHQ+PC9zdmc+',
        type: 'image',
        category: 'Workspace',
        description: 'Our open layout collaborative engineering center in Sector V, Salt Lake, Kolkata.'
      },
      {
        title: 'B2B Client Strategy Sprint Session',
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImcyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzBmMTcyYSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxZTFiNGIiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2cyKSIvPgogIDxjaXJjbGUgY3g9IjQwMCIgY3k9IjMwMCIgcj0iMTQwIiBmaWxsPSIjYTg1NWY3IiBvcGFjaXR5PSIwLjEiLz4KICA8cmVjdCB4PSIyNTAiIHk9IjIwMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIHJ4PSIxNSIgZmlsbD0iI2E4NTVmNyIgb3BhY2l0eT0iMC4xNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmOGZhZmMiPkIyQiBTdHJhdGVneSBTcHJpbnQ8L3RleHQ+CiAgPHRleHQgeD0iNTAlIiB5PSI1NyUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjODE4Y2Y4Ij5Qcm9kdWN0IFdoaXRlYm9hcmQgJmFtcDsgRGVjb3VwbGVkIFNjaGVtYXM8L3RleHQ+Cjwvc3ZnPg==',
        type: 'image',
        category: 'Sprints',
        description: 'Product managers and software architects whiteboard decoupled headless schemas.'
      },
      {
        title: 'Outpro Platform Architectural Briefing',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        type: 'video',
        category: 'Engineering',
        description: 'A walk-through showing Docker configurations and modular folder pipelines.'
      }
    ]);
    console.log('Seeded gallery items.');

    // 10. Seed FAQs
    await FAQ.insertMany([
      {
        question: 'What types of development methodologies do you support?',
        answer: 'We operate strictly under bi-weekly Agile sprints. We configure project boards on our Client Portal so you can track implementation progress, clear milestones, and review staging environments in real time.',
        category: 'Process'
      },
      {
        question: 'How do you ensure enterprise-level application security?',
        answer: 'We secure operations by enforcing strict Role-Based Access Control (RBAC), implementing rate limiters, using Helmet protection headers, hashing secrets, and recording administrative audit logs for compliance checks.',
        category: 'Security'
      },
      {
        question: 'Can we hire Outpro developers for direct staff augmentation?',
        answer: 'Yes! We offer flexible custom software contracts where our experienced React/Node developers and cloud architects work directly as integrated extensions of your internal software divisions.',
        category: 'Billing'
      }
    ]);
    console.log('Seeded FAQs.');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
