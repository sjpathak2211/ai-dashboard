-- Seed data for AI Progress Dashboard
-- Run this after schema.sql to populate with sample data

-- Insert sample projects
INSERT INTO public.projects (title, description, status, progress, assigned_team, priority, department, budget, tags, start_date, estimated_completion)
VALUES 
  (
    'AI-Powered Patient Triage System',
    'Implement machine learning algorithms to automatically prioritize patient cases based on severity and urgency.',
    'In Progress',
    65,
    'Clinical AI Team',
    'High',
    'Clinical Operations',
    150000,
    ARRAY['ML', 'Patient Care', 'Automation'],
    '2024-01-15',
    '2024-03-30'
  ),
  (
    'Automated Medical Record Analysis',
    'Natural language processing system to extract key insights from patient medical records.',
    'Testing',
    85,
    'Data Science Team',
    'High',
    'IT',
    200000,
    ARRAY['NLP', 'Medical Records', 'Analytics'],
    '2023-11-01',
    '2024-02-15'
  ),
  (
    'Predictive Surgery Scheduling',
    'AI system to optimize surgery scheduling based on historical data and resource availability.',
    'Planning',
    25,
    'Operations AI Team',
    'Medium',
    'Clinical Operations',
    120000,
    ARRAY['Scheduling', 'Optimization', 'Surgery'],
    '2024-02-01',
    '2024-06-01'
  ),
  (
    'Clinical Decision Support AI',
    'AI assistant to provide real-time clinical decision support to healthcare providers.',
    'Complete',
    100,
    'Clinical AI Team',
    'High',
    'Clinical Operations',
    300000,
    ARRAY['Clinical Support', 'Real-time', 'AI Assistant'],
    '2023-08-01',
    '2023-12-15'
  ),
  (
    'Inventory Management Optimization',
    'Machine learning system to predict and optimize medical supply inventory levels.',
    'In Progress',
    40,
    'Supply Chain AI Team',
    'Medium',
    'Administration',
    80000,
    ARRAY['Inventory', 'Supply Chain', 'Prediction'],
    '2024-01-01',
    '2024-04-30'
  ),
  (
    'AI-Enhanced Quality Metrics',
    'Automated system for tracking and analyzing healthcare quality metrics using AI.',
    'Planning',
    15,
    'Quality AI Team',
    'Medium',
    'Quality Assurance',
    95000,
    ARRAY['Quality Metrics', 'Analytics', 'Automation'],
    '2024-02-15',
    '2024-07-01'
  );

-- Note: User data and AI requests will be created dynamically as users sign up and submit requests
-- The admin users will be automatically detected based on email addresses in the handle_new_user() function