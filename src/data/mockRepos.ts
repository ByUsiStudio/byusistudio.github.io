export interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  archived: boolean;
  has_issues: boolean;
  open_issues_count: number;
}

export const mockRepos: Repo[] = [
];
