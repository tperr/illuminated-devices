DELIMITER //
USE blacklight //
CREATE OR REPLACE PROCEDURE get_new_refresh_from_login(c_id BIGINT(20) UNSIGNED, r_uri VARCHAR(80), auth_grant_uuid CHAR(36), code_chal CHAR(64))
	BEGIN NOT ATOMIC
	DECLARE r_token, u_id, auth_grant VARBINARY(16);
	DECLARE grant_state, challenge_state INT;

	START TRANSACTION;
		-- Get the state of the grant (0, 1, or 2)
		-- 0: The grant is fresh and unused
		-- 1: The grant is expired
		-- 2: The grant is fresh, but has already been used
		SET auth_grant = UUID_TO_BIN(auth_grant_uuid, 0);
		SET grant_state = (SELECT blacklight_validate_auth_is_fresh(auth_grant));

		IF (grant_state > 0) THEN
				-- If expired > 0 then do not generate a new token
			IF (grant_state > 1) THEN
				-- The grant has already been used, so we must revoke the refresh token that this grant has generated
				DELETE FROM refresh_tokens WHERE authorization_code=auth_grant;
			-- If the grant is expired, we don't need to do anything
			END IF;
			SELECT "access_denied";
		-- If the grant_state is 0 then
		ELSE
			SET u_id = (SELECT blacklight_validate_client_for_auth(c_id, r_uri, auth_grant));
			IF ISNULL(u_id) THEN
				-- If redirect is NULL, then the c_id/r_uri/auth_grant combination is invalid
				SELECT "unauthorized_client";
			ELSE
			-- Client is valid and auth code hasn't been used yet
			-- Validate code challenges before continuing
				SET challenge_state = (SELECT blacklight_compare_auth_and_challenge(auth_grant, code_chal));
				IF (challenge_state < 1) THEN
					-- The code challenge provided doesn't match the authorization grant provided
					SELECT "invalid_request_challenge";
				ELSE
					-- Valid client, unused auth code, code verifier matches code challenge
					-- We can generate a new refresh_token and administer it to the client
					SET r_token = UUID_TO_BIN(UUID(), 0);

					UPDATE auth_codes
					SET used=1
					WHERE authorization_code=auth_grant;

					INSERT INTO refresh_tokens (refresh_token, authorization_code, id) VALUES (r_token, auth_grant, u_id);

					SELECT T.refresh_token, T.expiration, T.id, A.account_scope
					FROM
					(SELECT refresh_token, expiration, id FROM refresh_tokens WHERE refresh_token=r_token) AS T
					INNER JOIN
					(SELECT id, account_scope FROM accounts WHERE id=u_id) AS A
					ON T.id=A.id;
				END IF;
			END IF;
		END IF;
	COMMIT;
END //
DELIMITER ;
