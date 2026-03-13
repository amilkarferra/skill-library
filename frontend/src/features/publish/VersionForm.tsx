import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from './FileUpload';
import { uploadNewVersion } from './publish.service';
import { AlertMessage } from '../../shared/components/AlertMessage';
import { Button } from '../../shared/components/Button';
import './VersionForm.css';

const MISSING_FILE_ERROR = 'Please select a skill file to upload';

interface VersionFormProps {
  readonly slug: string;
}

export function VersionForm({ slug }: VersionFormProps) {
  const navigate = useNavigate();
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleVersionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setVersion(event.target.value);
    }, []
  );

  const handleChangelogChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setChangelog(event.target.value);
    }, []
  );

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    const hasNoFile = selectedFile === null;
    if (hasNoFile) {
      setSubmitError(MISSING_FILE_ERROR);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append('version', version);
    formData.append('changelog', changelog);
    formData.append('file', selectedFile);

    try {
      await uploadNewVersion(slug, formData);
      navigate(`/skills/${slug}`);
    } catch (error) {
      const isStandardError = error instanceof Error;
      const errorMessage = isStandardError
        ? error.message
        : 'Failed to upload version';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [version, changelog, selectedFile, slug, navigate]);

  const hasSubmitError = submitError !== null;
  const buttonText = isSubmitting ? 'Uploading...' : 'Upload Version';

  return (
    <form className="version-form" onSubmit={handleSubmit}>
      {hasSubmitError && (
        <AlertMessage variant="error">{submitError}</AlertMessage>
      )}

      <div className="version-form-field">
        <label htmlFor="version" className="version-form-label">
          Version number
          <span className="version-form-required">*</span>
        </label>
        <input
          id="version"
          type="text"
          className="version-form-input"
          value={version}
          onChange={handleVersionChange}
          placeholder="e.g. 1.2.0"
          required
        />
      </div>

      <div className="version-form-field">
        <label htmlFor="changelog" className="version-form-label">
          Changelog
          <span className="version-form-required">*</span>
        </label>
        <textarea
          id="changelog"
          className="version-form-input"
          rows={5}
          value={changelog}
          onChange={handleChangelogChange}
          placeholder="Describe the changes in this version"
          required
        />
      </div>

      <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />

      <div className="version-form-actions">
        <Button variant="primary" size="large" type="submit" disabled={isSubmitting}>
          {buttonText}
        </Button>
      </div>
    </form>
  );
}
