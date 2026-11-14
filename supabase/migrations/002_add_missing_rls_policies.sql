-- Add missing RLS Policies for rewrites table
CREATE POLICY "Users can view their project rewrites"
  ON rewrites FOR SELECT
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert rewrites in their projects"
  ON rewrites FOR INSERT
  WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their project rewrites"
  ON rewrites FOR UPDATE
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their project rewrites"
  ON rewrites FOR DELETE
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Add missing RLS Policies for summaries table
CREATE POLICY "Users can view their project summaries"
  ON summaries FOR SELECT
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert summaries in their projects"
  ON summaries FOR INSERT
  WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their project summaries"
  ON summaries FOR UPDATE
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their project summaries"
  ON summaries FOR DELETE
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Add missing RLS Policies for generated_articles table
CREATE POLICY "Users can insert articles in their projects"
  ON generated_articles FOR INSERT
  WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their project articles"
  ON generated_articles FOR UPDATE
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their project articles"
  ON generated_articles FOR DELETE
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Add missing RLS Policies for video_projects table
CREATE POLICY "Users can view their video projects"
  ON video_projects FOR SELECT
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert video projects in their projects"
  ON video_projects FOR INSERT
  WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their video projects"
  ON video_projects FOR UPDATE
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their video projects"
  ON video_projects FOR DELETE
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Add missing RLS Policies for video_scenes table
CREATE POLICY "Users can view video scenes in their projects"
  ON video_scenes FOR SELECT
  USING (
    video_project_id IN (
      SELECT vp.id FROM video_projects vp
      WHERE vp.project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert video scenes in their projects"
  ON video_scenes FOR INSERT
  WITH CHECK (
    video_project_id IN (
      SELECT vp.id FROM video_projects vp
      WHERE vp.project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update video scenes in their projects"
  ON video_scenes FOR UPDATE
  USING (
    video_project_id IN (
      SELECT vp.id FROM video_projects vp
      WHERE vp.project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete video scenes in their projects"
  ON video_scenes FOR DELETE
  USING (
    video_project_id IN (
      SELECT vp.id FROM video_projects vp
      WHERE vp.project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    )
  );

-- Add missing RLS Policies for characters table (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view characters"
  ON characters FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add missing RLS Policies for voice_profiles table (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view voice profiles"
  ON voice_profiles FOR SELECT
  USING (auth.role() = 'authenticated');
