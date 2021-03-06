import { useState, useEffect } from "react";
import githubUsersEndpoint from "../services/github-users.service";

/**
 * @description Output type for the useUsersUpdater hook.
 */
export interface IUseUsersUpdaterOutput {
  pageState: [
    { pageNumber: number },
    React.Dispatch<React.SetStateAction<{ pageNumber: number }>>
  ];
  submittedUserState: [string, React.Dispatch<React.SetStateAction<string>>];
  users;
  totalCount: number;
  loading: boolean;
  error: boolean;
  hasMore: boolean;
}

/**
 * @description Handles updating search results in the search page.
 */
export default function useUsersUpdater() {
  const [submittedUser, setSubmittedUser] = useState("");
  const [page, setPage] = useState({ pageNumber: 1 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [users, setUsers] = useState(new Array<string>());
  const [totalCount, setTotalCount] = useState(-1);

  const { getUsers } = githubUsersEndpoint();

  useEffect(() => {
    const { pageNumber } = page;

    if (submittedUser === "") return;
    const updateUsers = async () => {
      try {
        setLoading(true);
        const {items: newUsers, total_count} = (await getUsers(submittedUser, pageNumber)).data;
        setUsers((prevUsers) => [
          ...(pageNumber > 1 ? prevUsers : []),
          ...newUsers.map(({ id, login, email, bio, avatar_url, html_url }) => ({
            id,
            login,
            email,
            bio,
            avatar_url,
            html_url
          })),
        ]);
        setTotalCount(total_count);
        setLoading(false);
        setHasMore(newUsers.length > 0);
      } catch (e) {
        setError(true);
      }
    };
    updateUsers();
  }, [page, submittedUser]);

  useEffect(() => {
    setPage({ pageNumber: 1 });
  }, [submittedUser]);

  return {
    pageState: [page, setPage],
    submittedUserState: [submittedUser, setSubmittedUser],
    users,
    loading,
    error,
    hasMore,
    totalCount,
  } as IUseUsersUpdaterOutput;
}
