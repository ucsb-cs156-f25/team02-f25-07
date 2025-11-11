package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestIT {

  @Autowired public CurrentUserService currentUserService;
  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired public RecommendationRequestRepository recommendationRequestRepository;

  @Autowired public MockMvc mockMvc;
  @Autowired public ObjectMapper mapper;

  // keep UserRepository as a Mockito bean like RestaurantIT
  @MockitoBean UserRepository userRepository;

  // ---------- GET /api/recommendationrequests?id=... (exists) ----------
  @WithMockUser(roles = {"USER"})
  @Test
  public void user_can_get_by_id_when_exists() throws Exception {
    // arrange
    RecommendationRequest rr =
        RecommendationRequest.builder()
            .requesterEmail("student@ucsb.edu")
            .professorEmail("prof@ucsb.edu")
            .explanation("Scholarship")
            .dateRequested(LocalDateTime.parse("2025-01-31T13:45:00"))
            .dateNeeded(LocalDateTime.parse("2025-02-15T23:59:00"))
            .done(false)
            .build();

    rr = recommendationRequestRepository.save(rr); // id = 1

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/recommendationrequests?id=" + rr.getId()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expected = mapper.writeValueAsString(rr);
    String actual = response.getResponse().getContentAsString();
    assertEquals(expected, actual);
  }

  // ---------- GET /api/recommendationrequests?id=... (not found) ----------
  @WithMockUser(roles = {"USER"})
  @Test
  public void user_get_by_id_returns_404_when_not_found() throws Exception {
    mockMvc.perform(get("/api/recommendationrequests?id=999")).andExpect(status().isNotFound());
  }

  // ---------- GET /api/recommendationrequests/all ----------
  @WithMockUser(roles = {"USER"})
  @Test
  public void user_can_get_all() throws Exception {
    RecommendationRequest a =
        RecommendationRequest.builder()
            .requesterEmail("a@ucsb.edu")
            .professorEmail("p1@ucsb.edu")
            .explanation("A")
            .dateRequested(LocalDateTime.parse("2022-01-01T00:00:00"))
            .dateNeeded(LocalDateTime.parse("2022-01-31T23:59:00"))
            .done(false)
            .build();
    RecommendationRequest b =
        RecommendationRequest.builder()
            .requesterEmail("b@ucsb.edu")
            .professorEmail("p2@ucsb.edu")
            .explanation("B")
            .dateRequested(LocalDateTime.parse("2023-01-01T00:00:00"))
            .dateNeeded(LocalDateTime.parse("2023-01-31T23:59:00"))
            .done(true)
            .build();
    recommendationRequestRepository.save(a);
    recommendationRequestRepository.save(b);

    MvcResult response =
        mockMvc
            .perform(get("/api/recommendationrequests/all"))
            .andExpect(status().isOk())
            .andReturn();

    String expected = mapper.writeValueAsString(recommendationRequestRepository.findAll());
    String actual = response.getResponse().getContentAsString();
    assertEquals(expected, actual);
  }

  // ---------- POST /api/recommendationrequests/post (ADMIN only) ----------
  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_post_new() throws Exception {
    RecommendationRequest expected =
        RecommendationRequest.builder()
            .id(1L) // JPA will assign 1 on empty DB; set for JSON equality
            .requesterEmail("student@ucsb.edu")
            .professorEmail("advisor@ucsb.edu")
            .explanation("Recommendation for scholarship")
            .dateRequested(LocalDateTime.parse("2022-04-20T09:30:00"))
            .dateNeeded(LocalDateTime.parse("2022-05-01T23:59:00"))
            .done(true)
            .build();

    MvcResult response =
        mockMvc
            .perform(
                post("/api/recommendationrequests/post")
                    .param("requesterEmail", "student@ucsb.edu")
                    .param("professorEmail", "advisor@ucsb.edu")
                    .param("explanation", "Recommendation for scholarship")
                    .param("dateRequested", "2022-04-20T09:30:00")
                    .param("dateNeeded", "2022-05-01T23:59:00")
                    .param("done", "true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    assertEquals(mapper.writeValueAsString(expected), response.getResponse().getContentAsString());
  }

  // ---------- PUT /api/recommendationrequests?id=... (ADMIN) ----------
  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_update_existing() throws Exception {
    // original
    RecommendationRequest orig =
        RecommendationRequest.builder()
            .requesterEmail("old@ucsb.edu")
            .professorEmail("old@ucsb.edu")
            .explanation("old")
            .dateRequested(LocalDateTime.parse("2025-01-31T13:45:00"))
            .dateNeeded(LocalDateTime.parse("2025-02-15T23:59:00"))
            .done(false)
            .build();
    orig = recommendationRequestRepository.save(orig);

    // edited body
    RecommendationRequest edited =
        RecommendationRequest.builder()
            .requesterEmail("new@ucsb.edu")
            .professorEmail("new@ucsb.edu")
            .explanation("new explanation")
            .dateRequested(LocalDateTime.parse("2025-03-01T09:30:00"))
            .dateNeeded(LocalDateTime.parse("2025-03-20T23:59:00"))
            .done(true)
            .build();

    String body = mapper.writeValueAsString(edited);

    MvcResult resp =
        mockMvc
            .perform(
                put("/api/recommendationrequests?id=" + orig.getId())
                    .contentType("application/json")
                    .characterEncoding("utf-8")
                    .content(body)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // the controller returns the updated entity
    RecommendationRequest saved =
        recommendationRequestRepository.findById(orig.getId()).orElseThrow();
    assertEquals(edited.getRequesterEmail(), saved.getRequesterEmail());
    assertEquals(edited.getProfessorEmail(), saved.getProfessorEmail());
    assertEquals(edited.getExplanation(), saved.getExplanation());
    assertEquals(edited.getDateRequested(), saved.getDateRequested());
    assertEquals(edited.getDateNeeded(), saved.getDateNeeded());
    assertEquals(edited.getDone(), saved.getDone());

    assertEquals(mapper.writeValueAsString(saved), resp.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_update_returns_404_when_not_found() throws Exception {
    RecommendationRequest body =
        RecommendationRequest.builder()
            .requesterEmail("x@ucsb.edu")
            .professorEmail("y@ucsb.edu")
            .explanation("z")
            .dateRequested(LocalDateTime.parse("2024-01-01T00:00:00"))
            .dateNeeded(LocalDateTime.parse("2024-02-01T00:00:00"))
            .done(false)
            .build();
    String json = mapper.writeValueAsString(body);

    mockMvc
        .perform(
            put("/api/recommendationrequests?id=999")
                .contentType("application/json")
                .content(json)
                .with(csrf()))
        .andExpect(status().isNotFound());
  }

  // ---------- DELETE /api/recommendationrequests?id=... (ADMIN) ----------
  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_existing() throws Exception {
    RecommendationRequest rr =
        RecommendationRequest.builder()
            .requesterEmail("del@ucsb.edu")
            .professorEmail("prof@ucsb.edu")
            .explanation("to delete")
            .dateRequested(LocalDateTime.parse("2022-01-03T00:00:00"))
            .dateNeeded(LocalDateTime.parse("2022-02-01T00:00:00"))
            .done(false)
            .build();
    rr = recommendationRequestRepository.save(rr);

    MvcResult response =
        mockMvc
            .perform(delete("/api/recommendationrequests?id=" + rr.getId()).with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    assertEquals(
        ("{\"message\":\"RecommendationRequest with id " + rr.getId() + " deleted\"}"),
        response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_delete_returns_404_when_not_found() throws Exception {
    mockMvc
        .perform(delete("/api/recommendationrequests?id=777").with(csrf()))
        .andExpect(status().isNotFound());
  }
}
