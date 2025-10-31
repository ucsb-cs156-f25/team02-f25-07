import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function MenuItemReviewForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  // Stryker disable Regex
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d(:[0-5]\d(\.\d+)?)?)/i;
  // Stryker restore Regex

  const testIdPrefix = "MenuItemReviewForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col sm={12} md={6}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid={`${testIdPrefix}-id`}
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}

        <Col sm={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="itemId">itemId</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-itemId`}
              id="itemId"
              type="number"
              isInvalid={Boolean(errors.itemId)}
              {...register("itemId", {
                required: "itemId is required.",
                valueAsNumber: true,
                min: { value: 1, message: "itemId must be ≥ 1." },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.itemId?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col sm={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="reviewerEmail">reviewerEmail</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-reviewerEmail`}
              id="reviewerEmail"
              // 关键最小更改：用 text，让正则成为唯一来源
              type="text"
              placeholder="user@ucsb.edu"
              isInvalid={Boolean(errors.reviewerEmail)}
              {...register("reviewerEmail", {
                required: "reviewerEmail is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "invalid email address.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.reviewerEmail?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col sm={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="stars">stars (1–5)</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-stars`}
              id="stars"
              type="number"
              isInvalid={Boolean(errors.stars)}
              {...register("stars", {
                required: "stars is required.",
                valueAsNumber: true,
                min: { value: 1, message: "stars must be between 1 and 5." },
                max: { value: 5, message: "stars must be between 1 and 5." },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.stars?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col sm={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateReviewed">dateReviewed</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-dateReviewed`}
              id="dateReviewed"
              type="datetime-local"
              isInvalid={Boolean(errors.dateReviewed)}
              {...register("dateReviewed", {
                required: true,
                pattern: isodate_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateReviewed && "dateReviewed is required."}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col sm={12} md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="comments">comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              data-testid={`${testIdPrefix}-comments`}
              id="comments"
              isInvalid={Boolean(errors.comments)}
              {...register("comments", {
                required: "comments is required.",
                maxLength: { value: 500, message: "max 500 characters." },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.comments?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid={`${testIdPrefix}-cancel`}
            className="ms-2"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default MenuItemReviewForm;
