import type { LoaderFunction } from "@remix-run/node";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getMDXComponent } from 'mdx-bundler/client'
import { useMemo } from "react";
import { bundleMDXFromSource } from "~/mdx.server";

const repo = "example-mdx";
const blob = "main:readme.md";

const GraphQLQuery = `
query ($user: String!, $repo: String = "a", $blob: String = "main:readme.md") {
    repository(owner:$user, name: $repo) {
      object(expression: $blob) {
          ... on Blob {
             text
        }
      }
    }
    user(login:$user) {
      login
      name
      avatarUrl
    }
  }
`

async function fetchGraphQL(query: string, variables: object) {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `bearer ${process.env.GITHUB_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables, }),
  }
  const response = await fetch('https://api.github.com/graphql', options)
  return await response.json()
}

type Response = {
  data: {
    repository: null | {
      object: {
        text: string
      }
    },
    user: {
      login: string
      name: string
      avatarUrl: string
    }
  }
}

type LoaderData = {
  user: Response["data"]["user"],
  mdx: null | Awaited<ReturnType<typeof bundleMDXFromSource>>;
  error: null | string
}

export const loader: LoaderFunction = async ({ params }) => {
  const response = await fetchGraphQL(GraphQLQuery, { user: params.user, repo, blob }) as Response
  console.info(response)
  const { data: { repository, user } } = response;
  let mdx = null;
  let error = null;
  if (repository?.object?.text) {
    try {
      mdx = await bundleMDXFromSource(repository.object.text)
    } catch (e) {
      const err = e as Error
      error = err.message
    }
  }
  return json<LoaderData>({ user, mdx, error })

}

function noRepo() {
  return (
    <div>
      No se detecto {blob} el repositorio {repo}
    </div>
  )
}
export default function User() {
  const { user, mdx, error } = useLoaderData<LoaderData>();
  const Component = useMemo(() => mdx ? getMDXComponent(mdx.code) : noRepo, [mdx])

  if (!user) {
    return <div>Invalid user</div>
  }
  const href = `https://github.com/${user.login}/${repo}`;

  return (
    <div>
      <h1>{user.name}</h1>
      <h2>{user.login}</h2>
      <img src={user.avatarUrl} />
      <main>
        {error ? <div>{error}</div> : <Component />}
      </main>
      <a href={href}>Utilizando el repo {href}</a>
    </div>
  )
}
