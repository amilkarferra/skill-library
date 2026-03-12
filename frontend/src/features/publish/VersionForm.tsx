import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from './FileUpload';
import { uploadNewVersion } from './publish.service';
import './VersionForm.css';

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
      setSubmitError('Please select a skill file to upload');
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
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to upload version';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [version, changelog, selectedFile, slug, navigate]);

  return (
    <form className="version-form" onSubmit={handleSubmit}>
      {submitError && (
        <div className="version-form-error">{submitError}</div>
      )}

      <div className="version-form-field">
        <label className="version-form-label label-uppercase" htmlFor="version">
          VERSION NUMBER
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
        <label className="version-form-label label-uppercase" htmlFor="changelog">
          CHANGELOG
        </label>
        <textarea
          id="changelog"
          className="version-form-textarea"
          rows={5}
          value={changelog}
          onChange={handleChangelogChange}
          required
        />
      </div>

      <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />

      <div className="version-form-actions">
        <button
          type="submit"
          className="version-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Uploading...' : 'Upload Version'}
        </button>
      </div>
    </form>
  );
}
