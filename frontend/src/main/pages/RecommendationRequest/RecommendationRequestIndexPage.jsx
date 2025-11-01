import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function RecommendationRequestIndexPage() {
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Index page for Recommendation Request (placeholder)</h1>
        <p><a href="/recommendationrequest/create">Create</a></p>
        <p><a href="/recommendationrequest/edit/1">Edit</a></p>
      </div>
    </BasicLayout>
  );
}
