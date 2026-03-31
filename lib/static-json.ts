import fs from "fs";
import path from "path";
import { z } from "zod";

const rulesSchema = z
  .object({
    version: z.number().int().nonnegative(),
    matching: z
      .object({
        min_match_score: z.number(),
        require_recommended_flag: z.boolean(),
        prioritize_titles: z.array(z.string()),
        secondary_titles: z.array(z.string()),
        title_priority_boosts: z.record(z.string(), z.number()),
      })
      .passthrough(),
    hard_filters: z
      .object({
        exclude_open_opportunities: z.boolean(),
        exclude_titles_containing: z.array(z.string()),
        exclude_keywords_in_description: z.array(z.string()),
        allowed_work_models: z.array(z.string()),
        exclude_work_models: z.array(z.string()),
      })
      .passthrough(),
    queue: z
      .object({
        max_new_linear_issues_per_day: z.number().int().nonnegative(),
        carry_over_overflow: z.boolean(),
        max_job_age_days: z.number().int().nonnegative(),
        recheck_queued_jobs_each_run: z.boolean(),
        drop_jobs_if_closed: z.boolean(),
      })
      .passthrough(),
    deduplication: z
      .object({
        dedupe_by: z.array(z.string()),
        ignore_query_params: z.boolean(),
        cross_source_duplicate_window_days: z.number().int().nonnegative(),
      })
      .passthrough(),
    scoring: z
      .object({
        batch_size_for_llm_matching: z.number().int().positive(),
        max_description_chars_per_job: z.number().int().positive(),
        prefer_remote: z.boolean(),
        prefer_europe_friendly: z.boolean(),
        penalize_unclear_location: z.boolean(),
      })
      .passthrough(),
    linear: z
      .object({
        create_issue_only_if_above_threshold: z.boolean(),
        default_team_key: z.string(),
        default_labels: z.array(z.string()),
        include_match_reasons: z.boolean(),
        include_dealbreakers: z.boolean(),
      })
      .passthrough(),
    operations: z
      .object({
        runs_per_day: z.number().int().positive(),
        timezone: z.string(),
        log_level: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

const sourceSchema = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    url: z.string().url(),
    enabled: z.boolean(),
    tags: z.array(z.string()),
  })
  .passthrough();

const sourcesSchema = z
  .object({
    version: z.number().int().nonnegative(),
    mode: z.string(),
    sources: z.array(sourceSchema),
  })
  .passthrough();

type RulesConfig = z.infer<typeof rulesSchema>;
type SourcesConfig = z.infer<typeof sourcesSchema>;

function readJsonFile<T>(fileName: string, schema: z.ZodSchema<T>): T {
  const filePath = path.join(process.cwd(), "content", fileName);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(fileContents) as unknown;

  return schema.parse(parsed);
}

export function getRulesConfig(): RulesConfig {
  return readJsonFile("rules.json", rulesSchema);
}

export function getSourcesConfig(): SourcesConfig {
  return readJsonFile("sources.json", sourcesSchema);
}

export type { RulesConfig, SourcesConfig };
