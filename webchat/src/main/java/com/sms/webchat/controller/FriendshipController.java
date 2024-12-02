package com.sms.webchat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import com.sms.webchat.dto.FriendshipDTO;
import com.sms.webchat.dto.response.ApiResponseDto;
import com.sms.webchat.enums.FriendshipStatus;
import com.sms.webchat.service.FriendshipService;
import com.sms.webchat.service.UserService;
import com.sms.webchat.dto.UserDTO;

import java.util.List;

@RestController
@RequestMapping("/friendship")
@RequiredArgsConstructor
public class FriendshipController {
    private final UserService userService;
    private final FriendshipService friendshipService;

    @GetMapping("/find")
    public ResponseEntity<?> findUsers(@RequestParam String keyword) {
        try {
            List<UserDTO> users = userService.findUsersByIdLike(keyword);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponseDto(false, e.getMessage()));
        }
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestFriendship(
            @RequestParam Long fromUserIdx,
            @RequestParam Long toUserIdx) {
        try {
            Long friendshipId = friendshipService.createFriendshipRequest(fromUserIdx, toUserIdx);
            return ResponseEntity.ok()
                .body(new ApiResponseDto(true, "친구 요청을 보냈습니다.", friendshipId));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponseDto(false, e.getMessage()));
        }
    }

    @PostMapping("/response")
    public ResponseEntity<?> respondToFriendship(
            @RequestParam Long friendshipId,
            @RequestParam FriendshipStatus status,
            @RequestParam Long userIdx) {
        try {
            if (status == FriendshipStatus.REJECTED) {
                friendshipService.deleteFriendship(friendshipId);
                return ResponseEntity.ok()
                    .body(new ApiResponseDto(true, "친구 요청을 거절했습니다."));
            } else if (status == FriendshipStatus.BLOCKED) {
                friendshipService.blockFriendship(friendshipId, status, userIdx);
                return ResponseEntity.ok()
                    .body(new ApiResponseDto(true, "해당 유저를 차단했습니다."));
            } else {
                friendshipService.updateFriendshipStatus(friendshipId, status);
                return ResponseEntity.ok()
                    .body(new ApiResponseDto(true, "친구 요청을 처리했습니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponseDto(false, e.getMessage()));
        }
    }

    @GetMapping("/list/{userIdx}")
    public ResponseEntity<?> getFriendshipList(
            @PathVariable Long userIdx,
            @RequestParam(required = false) FriendshipStatus status) {
        try {
            List<FriendshipDTO> friendships = friendshipService.getFriendshipsByUserIdx(userIdx, status);
            return ResponseEntity.ok(friendships);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponseDto(false, e.getMessage()));
        }
    }


} 