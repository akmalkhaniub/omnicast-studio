import { Client, cacheExchange, fetchExchange } from 'urql';

const API_GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql';

export const graphqlClient = new Client({
  url: API_GRAPHQL_URL,
  exchanges: [cacheExchange, fetchExchange],
});

export const GRAPHQL_QUERIES = {
  WORKSPACE_OVERVIEW: `
    query GetWorkspace($id: ID!) {
      workspace(id: $id) {
        id
        title
        description
        sources {
          id
          title
          sourceType
          tokenCount
          createdAt
        }
        knowledgeGraph {
          totalNodes
          totalEdges
          nodes {
            id
            label
            category
            communityId
            degree
            citation {
              sourceId
              sourceTitle
              pageNumber
              snippet
            }
          }
          edges {
            id
            source
            target
            relationship
            weight
          }
        }
        episodes {
          id
          title
          summary
          audioUrl
          durationMs
          status
          dialogue {
            id
            speaker
            text
            startMs
            endMs
            citations {
              sourceId
              sourceTitle
              pageNumber
              snippet
            }
          }
          createdAt
        }
        createdAt
      }
    }
  `,
  INGEST_DOCUMENT: `
    mutation IngestDocument($input: IngestDocumentInput!) {
      ingestDocument(input: $input) {
        id
        title
        sourceType
        tokenCount
        createdAt
      }
    }
  `,
  TRIGGER_PODCAST_SYNTHESIS: `
    mutation TriggerPodcastSynthesis($input: GeneratePodcastInput!) {
      triggerPodcastSynthesis(input: $input) {
        id
        title
        summary
        audioUrl
        durationMs
        status
        dialogue {
          id
          speaker
          text
          startMs
          endMs
        }
      }
    }
  `,
};
