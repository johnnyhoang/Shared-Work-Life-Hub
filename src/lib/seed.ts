import { db } from './db';

export function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    return; // Already seeded
  }

  const now = new Date();
  const getPastIso = (hoursAgo: number) => {
    const d = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    return d.toISOString();
  };
  const getFutureIso = (daysAhead: number) => {
    const d = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    return d.toISOString();
  };

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, avatar, email, timezone, location, flag, role, color, last_visited_at)
    VALUES (@id, @name, @avatar, @email, @timezone, @location, @flag, @role, @color, @last_visited_at)
  `);

  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, description, color, icon, status, created_at, updated_at)
    VALUES (@id, @name, @description, @color, @icon, @status, @created_at, @updated_at)
  `);

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, project_id, creator_id, assignee_id, status, priority, due_date, created_at, updated_at)
    VALUES (@id, @title, @description, @project_id, @creator_id, @assignee_id, @status, @priority, @due_date, @created_at, @updated_at)
  `);

  const insertIdea = db.prepare(`
    INSERT INTO ideas (id, title, description, status, project_id, creator_id, created_at, updated_at)
    VALUES (@id, @title, @description, @status, @project_id, @creator_id, @created_at, @updated_at)
  `);

  const insertKnowledge = db.prepare(`
    INSERT INTO knowledge (id, topic, notes, status, project_id, user_id, created_at, updated_at)
    VALUES (@id, @topic, @notes, @status, @project_id, @user_id, @created_at, @updated_at)
  `);

  const insertDecision = db.prepare(`
    INSERT INTO decisions (id, title, reason, project_id, created_by_id, created_at)
    VALUES (@id, @title, @reason, @project_id, @created_by_id, @created_at)
  `);

  const insertComment = db.prepare(`
    INSERT INTO comments (id, entity_type, entity_id, user_id, content, created_at)
    VALUES (@id, @entity_type, @entity_id, @user_id, @content, @created_at)
  `);

  const insertActivity = db.prepare(`
    INSERT INTO activities (id, actor_id, target_user_id, entity_type, entity_id, action_type, summary, details, project_id, created_at)
    VALUES (@id, @actor_id, @target_user_id, @entity_type, @entity_id, @action_type, @summary, @details, @project_id, @created_at)
  `);

  const transaction = db.transaction(() => {
    // 1. Users
    insertUser.run({
      id: 'usr_johnny',
      name: 'Johnny',
      avatar: '👨‍💻',
      email: 'johnny@worklifehub.dev',
      timezone: 'Asia/Ho_Chi_Minh',
      location: 'Hanoi (UTC+7)',
      flag: '🇻🇳',
      role: 'Fullstack & Cloud Engineer',
      color: '#3b82f6',
      last_visited_at: getPastIso(4),
    });

    insertUser.run({
      id: 'usr_child',
      name: 'Child',
      avatar: '👩‍🎨',
      email: 'child@worklifehub.dev',
      timezone: 'Europe/London',
      location: 'London (UTC+0)',
      flag: '🇬🇧',
      role: 'Product Designer & Frontend',
      color: '#ec4899',
      last_visited_at: getPastIso(14),
    });

    // 2. Projects
    insertProject.run({
      id: 'proj_house_renting',
      name: 'House Renting App',
      description: 'Mobile-first rental marketplace for expats, digital nomads and remote teams',
      color: '#6366f1',
      icon: 'home',
      status: 'active',
      created_at: getPastIso(120),
      updated_at: getPastIso(2),
    });

    insertProject.run({
      id: 'proj_english_learning',
      name: 'English Learning App',
      description: 'Interactive vocabulary, listening and pronunciation trainer',
      color: '#10b981',
      icon: 'book-open',
      status: 'active',
      created_at: getPastIso(96),
      updated_at: getPastIso(18),
    });

    insertProject.run({
      id: 'proj_aws_infra',
      name: 'AWS Infrastructure',
      description: 'Terraform IaC, ECS Fargate cluster, Multi-AZ RDS and CloudFront CDN',
      color: '#f59e0b',
      icon: 'server',
      status: 'active',
      created_at: getPastIso(150),
      updated_at: getPastIso(6),
    });

    insertProject.run({
      id: 'proj_personal_brand',
      name: 'Personal Website & Blog',
      description: 'Engineering blog posts, portfolio showcases and interactive tech demos',
      color: '#8b5cf6',
      icon: 'globe',
      status: 'paused',
      created_at: getPastIso(200),
      updated_at: getPastIso(72),
    });

    // 3. Tasks
    insertTask.run({
      id: 'tsk_api_review',
      title: 'Review House Renting API & Swagger spec',
      description: 'Check auth headers, pagination schema, and filter query parameters for mobile clients.',
      project_id: 'proj_house_renting',
      creator_id: 'usr_child',
      assignee_id: 'usr_johnny',
      status: 'in_progress',
      priority: 'urgent',
      due_date: getFutureIso(1),
      created_at: getPastIso(5),
      updated_at: getPastIso(2),
    });

    insertTask.run({
      id: 'tsk_postgis_search',
      title: 'Implement property search with PostGIS',
      description: 'Write spatial radius query using ST_DWithin and bounding box index for map viewport search.',
      project_id: 'proj_house_renting',
      creator_id: 'usr_johnny',
      assignee_id: 'usr_johnny',
      status: 'in_progress',
      priority: 'high',
      due_date: getFutureIso(3),
      created_at: getPastIso(24),
      updated_at: getPastIso(3),
    });

    insertTask.run({
      id: 'tsk_onboarding_ui',
      title: 'Design mobile onboarding flow & wireframes',
      description: 'Create 3-step lightweight onboarding: profile setup, role preference, and instant start.',
      project_id: 'proj_house_renting',
      creator_id: 'usr_johnny',
      assignee_id: 'usr_child',
      status: 'todo',
      priority: 'high',
      due_date: getFutureIso(2),
      created_at: getPastIso(8),
      updated_at: getPastIso(8),
    });

    insertTask.run({
      id: 'tsk_vpc_study',
      title: 'AWS VPC peering & subnet routing guide',
      description: 'Completed architecture writeup for cross-region private VPC connectivity.',
      project_id: 'proj_aws_infra',
      creator_id: 'usr_johnny',
      assignee_id: 'usr_johnny',
      status: 'done',
      priority: 'medium',
      due_date: getPastIso(1),
      created_at: getPastIso(30),
      updated_at: getPastIso(6),
    });

    insertTask.run({
      id: 'tsk_cicd_pipeline',
      title: 'Setup GitHub Actions CI/CD for staging',
      description: 'Automate linting, unit tests, and Docker container push to AWS ECR.',
      project_id: 'proj_aws_infra',
      creator_id: 'usr_child',
      assignee_id: 'usr_johnny',
      status: 'inbox',
      priority: 'medium',
      due_date: getFutureIso(5),
      created_at: getPastIso(12),
      updated_at: getPastIso(12),
    });

    insertTask.run({
      id: 'tsk_pronunciation_dataset',
      title: 'Draft English phonetic pronunciation audio samples',
      description: 'Prepare audio dataset for common accent variations in tech interviews.',
      project_id: 'proj_english_learning',
      creator_id: 'usr_johnny',
      assignee_id: 'usr_child',
      status: 'todo',
      priority: 'medium',
      due_date: getFutureIso(4),
      created_at: getPastIso(16),
      updated_at: getPastIso(16),
    });

    insertTask.run({
      id: 'tsk_security_audit',
      title: 'Security audit on JWT refresh token rotation',
      description: 'Ensure revocation lists work seamlessly on Redis with minimal latency.',
      project_id: 'proj_house_renting',
      creator_id: 'usr_child',
      assignee_id: 'usr_johnny',
      status: 'todo',
      priority: 'urgent',
      due_date: getFutureIso(1),
      created_at: getPastIso(3),
      updated_at: getPastIso(3),
    });

    // 4. Ideas
    insertIdea.run({
      id: 'idea_voice_eval',
      title: 'AI pronunciation evaluation using Web Audio API',
      description: 'Real-time pitch and phoneme waveform analyzer directly in the browser.',
      status: 'planned',
      project_id: 'proj_english_learning',
      creator_id: 'usr_child',
      created_at: getPastIso(20),
      updated_at: getPastIso(5),
    });

    insertIdea.run({
      id: 'idea_rent_split',
      title: 'Split rent & utility calculator for roommates',
      description: 'Auto-calculate electricity, water and cleaning chores with 1-click summary sharing.',
      status: 'maybe',
      project_id: 'proj_house_renting',
      creator_id: 'usr_johnny',
      created_at: getPastIso(48),
      updated_at: getPastIso(48),
    });

    insertIdea.run({
      id: 'idea_voice_memos',
      title: 'Daily async 60-second voice memos',
      description: 'Quick morning check-in to avoid long meetings across opposing time zones.',
      status: 'idea',
      project_id: null,
      creator_id: 'usr_child',
      created_at: getPastIso(10),
      updated_at: getPastIso(10),
    });

    // 5. Knowledge
    insertKnowledge.run({
      id: 'knw_aws_vpc',
      topic: 'AWS Multi-AZ VPC Architecture',
      notes: '• Public subnets for ALBs and NAT Gateways\n• Private subnets for ECS tasks\n• Isolated subnets for Aurora PostgreSQL\n• Route Tables strictly separated',
      status: 'learning',
      project_id: 'proj_aws_infra',
      user_id: 'usr_johnny',
      created_at: getPastIso(70),
      updated_at: getPastIso(6),
    });

    insertKnowledge.run({
      id: 'knw_postgis',
      topic: 'PostgreSQL PostGIS Spatial Indexing',
      notes: '• Use geometry(Point, 4326) for GPS coordinates\n• GiST indexing on geom column\n• ST_DWithin(geom, ST_MakePoint(lon, lat)::geography, distance_in_meters)',
      status: 'mastered',
      project_id: 'proj_house_renting',
      user_id: 'usr_johnny',
      created_at: getPastIso(60),
      updated_at: getPastIso(24),
    });

    insertKnowledge.run({
      id: 'knw_react19',
      topic: 'React 19 Server Actions & Optimistic State',
      notes: '• useActionState handles server action pending & error state\n• useOptimistic renders instant client response\n• Simplified form submissions without custom useEffect handlers',
      status: 'learning',
      project_id: null,
      user_id: 'usr_child',
      created_at: getPastIso(40),
      updated_at: getPastIso(12),
    });

    // 6. Decisions
    insertDecision.run({
      id: 'dec_postgis',
      title: 'Use PostgreSQL + PostGIS for spatial search',
      reason: 'Need fast radius search and polygon geofencing without adding Elasticsearch infrastructure cost.',
      project_id: 'proj_house_renting',
      created_by_id: 'usr_johnny',
      created_at: getPastIso(45),
    });

    insertDecision.run({
      id: 'dec_tailwind',
      title: 'Standardize on Tailwind CSS for all mobile UI modules',
      reason: 'Guarantees small bundle size, fast mobile rendering, and consistent design tokens across screens.',
      project_id: null,
      created_by_id: 'usr_child',
      created_at: getPastIso(36),
    });

    insertDecision.run({
      id: 'dec_ecs_fargate',
      title: 'Deploy containerized services on AWS ECS Fargate',
      reason: 'Zero server maintenance, automated scaling, and cost efficiency for 2-person production operations.',
      project_id: 'proj_aws_infra',
      created_by_id: 'usr_johnny',
      created_at: getPastIso(18),
    });

    // 7. Comments
    insertComment.run({
      id: 'cmt_1',
      entity_type: 'task',
      entity_id: 'tsk_api_review',
      user_id: 'usr_child',
      content: 'Added the filter query parameters in the OpenAPI schema. Take a look when you are online!',
      created_at: getPastIso(3),
    });

    insertComment.run({
      id: 'cmt_2',
      entity_type: 'task',
      entity_id: 'tsk_api_review',
      user_id: 'usr_johnny',
      content: 'Looks great! I am testing the endpoint pagination response right now.',
      created_at: getPastIso(1.5),
    });

    // 8. Activities (Recent chronological events)
    insertActivity.run({
      id: 'act_1',
      actor_id: 'usr_child',
      target_user_id: 'usr_johnny',
      entity_type: 'task',
      entity_id: 'tsk_security_audit',
      action_type: 'assigned',
      summary: 'Child assigned "Security audit on JWT refresh token rotation" to Johnny',
      details: 'Due tomorrow (Urgent priority)',
      project_id: 'proj_house_renting',
      created_at: getPastIso(3),
    });

    insertActivity.run({
      id: 'act_2',
      actor_id: 'usr_johnny',
      target_user_id: null,
      entity_type: 'task',
      entity_id: 'tsk_vpc_study',
      action_type: 'completed',
      summary: 'Johnny completed "AWS VPC peering & subnet routing guide"',
      details: 'Finished architecture diagrams and VPC route verification',
      project_id: 'proj_aws_infra',
      created_at: getPastIso(6),
    });

    insertActivity.run({
      id: 'act_3',
      actor_id: 'usr_johnny',
      target_user_id: 'usr_child',
      entity_type: 'task',
      entity_id: 'tsk_onboarding_ui',
      action_type: 'assigned',
      summary: 'Johnny assigned "Design mobile onboarding flow & wireframes" to Child',
      details: 'Focus on 3-step lightweight mobile screens',
      project_id: 'proj_house_renting',
      created_at: getPastIso(8),
    });

    insertActivity.run({
      id: 'act_4',
      actor_id: 'usr_child',
      target_user_id: null,
      entity_type: 'idea',
      entity_id: 'idea_voice_memos',
      action_type: 'created',
      summary: 'Child added a new idea "Daily async 60-second voice memos"',
      details: 'Lightweight concept to keep alignment across timezones',
      project_id: null,
      created_at: getPastIso(10),
    });

    insertActivity.run({
      id: 'act_5',
      actor_id: 'usr_child',
      target_user_id: 'usr_johnny',
      entity_type: 'task',
      entity_id: 'tsk_cicd_pipeline',
      action_type: 'assigned',
      summary: 'Child assigned "Setup GitHub Actions CI/CD for staging" to Johnny',
      details: 'Added staging pipeline requirements',
      project_id: 'proj_aws_infra',
      created_at: getPastIso(12),
    });

    insertActivity.run({
      id: 'act_6',
      actor_id: 'usr_johnny',
      target_user_id: null,
      entity_type: 'decision',
      entity_id: 'dec_ecs_fargate',
      action_type: 'decided',
      summary: 'Johnny recorded decision: "Deploy containerized services on AWS ECS Fargate"',
      details: 'Zero server maintenance and predictable auto-scaling',
      project_id: 'proj_aws_infra',
      created_at: getPastIso(18),
    });

    insertActivity.run({
      id: 'act_7',
      actor_id: 'usr_child',
      target_user_id: null,
      entity_type: 'idea',
      entity_id: 'idea_voice_eval',
      action_type: 'created',
      summary: 'Child added idea: "AI pronunciation evaluation using Web Audio API"',
      details: 'Real-time pitch and phoneme waveform analyzer in browser',
      project_id: 'proj_english_learning',
      created_at: getPastIso(20),
    });

    insertActivity.run({
      id: 'act_8',
      actor_id: 'usr_johnny',
      target_user_id: null,
      entity_type: 'task',
      entity_id: 'tsk_postgis_search',
      action_type: 'updated',
      summary: 'Johnny updated "Implement property search with PostGIS"',
      details: 'Added spatial query benchmark test results',
      project_id: 'proj_house_renting',
      created_at: getPastIso(24),
    });
  });

  transaction();
}
