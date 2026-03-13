import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category } from '../../shared/models/Category';
import type { Tag } from '../../shared/models/Tag';
import {
  extractFrontmatter,
  fetchCategories,
  fetchPopularTags,
} from './publish.service';
import { SidebarLayout } from '../../shared/components/SidebarLayout';
import { NavigationSidebar } from '../../shared/components/NavigationSidebar';
import { PublishDropzone } from './PublishDropzone';
import { ExtractingState } from './ExtractingState';
import { SkillDetailsForm } from './SkillDetailsForm';
import './PublishSkillPage.css';

type PublishState = 'upload' | 'extracting' | 'form';

const FADE_OUT_DELAY_MS = 400;

export function PublishSkillPage() {
  const navigate = useNavigate();

  const [publishState, setPublishState] = useState<PublishState>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedName, setExtractedName] = useState('');
  const [extractedDescription, setExtractedDescription] = useState('');
  const [isExtractionFailed, setIsExtractionFailed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isDropzoneFadingOut, setIsDropzoneFadingOut] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [fetchedCategories, fetchedTags] = await Promise.all([
          fetchCategories(),
          fetchPopularTags(),
        ]);
        setCategories(fetchedCategories);
        setAvailableTags(fetchedTags);
      } catch {
        setCategories([]);
        setAvailableTags([]);
      }
    };

    loadInitialData();
  }, []);

  const extractAndApplyFrontmatter = useCallback(async (file: File) => {
    try {
      const frontmatterResponse = await extractFrontmatter(file);
      setExtractedName(frontmatterResponse.extractedName);
      setExtractedDescription(frontmatterResponse.extractedDescription);
      setIsExtractionFailed(false);
    } catch {
      setIsExtractionFailed(true);
    }
    setPublishState('form');
  }, []);

  const handleFileAccepted = useCallback(
    async (file: File) => {
      setIsDropzoneFadingOut(true);
      setSelectedFile(file);

      await new Promise(resolve => setTimeout(resolve, FADE_OUT_DELAY_MS));
      setPublishState('extracting');
      await extractAndApplyFrontmatter(file);
    },
    [extractAndApplyFrontmatter]
  );

  const handleChangeFile = useCallback(async (file: File) => {
    setPublishState('extracting');
    setSelectedFile(file);
    setIsDropzoneFadingOut(false);
    await extractAndApplyFrontmatter(file);
  }, [extractAndApplyFrontmatter]);

  const handleSubmitSuccess = useCallback((skillSlug: string) => {
    navigate(`/skills/${skillSlug}`);
  }, [navigate]);

  const isUploadState = publishState === 'upload';
  const isExtractingState = publishState === 'extracting';
  const isFormState = publishState === 'form';
  const hasSelectedFile = selectedFile !== null;

  const subtitleText = isFormState
    ? 'Review the details and publish when ready'
    : 'Upload your skill file to get started';

  return (
    <SidebarLayout sidebar={<NavigationSidebar />}>
      <div className="publish-skill-page">
        <div className="publish-skill-badge">Publish</div>
        <h1 className="publish-skill-title">Publish a Skill</h1>
        <p className="publish-skill-subtitle">{subtitleText}</p>

        {isUploadState && (
          <PublishDropzone
            onFileAccepted={handleFileAccepted}
            isFadingOut={isDropzoneFadingOut}
          />
        )}

        {isExtractingState && hasSelectedFile && (
          <div className="publish-state-enter">
            <ExtractingState
              fileName={selectedFile.name}
              fileSize={selectedFile.size}
            />
          </div>
        )}

        {isFormState && hasSelectedFile && (
          <div className="publish-state-enter">
            <SkillDetailsForm
              file={selectedFile}
              extraction={{
                name: extractedName,
                description: extractedDescription,
                isFailed: isExtractionFailed,
              }}
              categories={categories}
              availableTags={availableTags}
              onChangeFile={handleChangeFile}
              onSubmitSuccess={handleSubmitSuccess}
            />
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
