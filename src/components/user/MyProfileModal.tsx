import React, { useState } from "react";

import { useMutation, useQueryClient } from "react-query";

import { nicknameCheck } from "../../shared/SignUpCheck";

import { api, apiToken } from "../../shared/apis/Apis";
import { deleteCookie, getCookie, setCookie } from "../../shared/Cookie";
import { useRef } from "react";
import styled, { keyframes } from "styled-components";
import chgImg from "../../images/chgImg.svg";
import Swal from "sweetalert2";
import { AxiosResponse } from "axios";
import Category from "../category/Category";
import Location from "../location/Location";

interface MyProfileModalProps {
  open: boolean;
  close: () => void;
  profileImage: string;
  introduction: string;
  nickname: string;
  category: string;
  location: string;
}

const MyProfileModal: React.FC<MyProfileModalProps> = ({
  open,
  close,
  profileImage,
  introduction,
  nickname,
  category,
  location,
}) => {
  const queryClient = useQueryClient();

  const [CHGintroduction, setCHGIntroduction] = useState<string>(introduction);
  const [CHGnickname, setCHGnickname] = useState<string>(nickname);
  const [previewImg, setpreviewImg] = useState<string>(profileImage);
  const [CHGprofileImg, setCHGprofileImg] = useState<string>(profileImage);
  const [CHGlocation, setCHGlocation] = useState<string>(location);
  const [CHGcategory, setCHGcategory] = useState<string>(category);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const PreNickname = getCookie("nickname");

  //닉네임 중복체크
  const getNickCheck = async (): Promise<AxiosResponse | null> => {
    if (!nicknameCheck(CHGnickname)) {
      return null;
    } else {
      const data = await api.post(`/api/user/${nickname}/existsNickname`, {
        nickname: CHGnickname,
      });
      return data;
    }
  };
  const handleDupnickClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    dupnick();
  };

  const { mutate: dupnick } = useMutation(getNickCheck, {
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      if (data === null) {
        Swal.fire({
          text: "닉네임 형식을 지켜주세요.",
          icon: "warning",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "확인",
        });
      } else {
        Swal.fire({
          text: "사용가능한 닉네임 입니다.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "확인",
        });
      }
    },
    onError: () => {
      Swal.fire({
        text: "닉네임 중복입니다.",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "확인",
      });
    },
  });

  //이미지 미리보기
  const encodeFileToBase64 = (fileBlob: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result?.toString() || "";
        setpreviewImg(result);
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(fileBlob);
    });
  };

  //프로필 변경
  const useProfile = async (): Promise<AxiosResponse | null> => {
    const formData = new FormData();

    formData.append("introduction", CHGintroduction);
    formData.append("nickname", CHGnickname);
    formData.append("image", CHGprofileImg);
    formData.append("location", CHGlocation);
    formData.append("category", CHGcategory);

    const data = await apiToken.patch("/api/user/edit", formData);

    return data;
  };
  const handleOnsubmitClick = () => {
    onsubmit();
  };

  const { mutate: onsubmit } = useMutation(useProfile, {
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      Swal.fire({
        text: "변경이 완료되었습니다.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "확인",
      });
      deleteCookie("nickname");
      deleteCookie("profileimage");
      deleteCookie("location");
      deleteCookie("category");
      setCookie("nickname", CHGnickname);
      setCookie("location", CHGlocation);
      setCookie("category", CHGcategory);
      setCookie("profileimage", data?.data.profileImage);
      close();
    },
    onError: () => {
      Swal.fire({
        text: "error",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "확인",
      });
      return;
    },
  });

  //프로필 변경
  const useProfile1 = async (): Promise<AxiosResponse | null> => {
    const formData = new FormData();

    formData.append("introduction", CHGintroduction);
    formData.append("image", CHGprofileImg);
    formData.append("location", CHGlocation);
    formData.append("category", CHGcategory);

    const data = await apiToken.patch("/api/user/edit", formData);

    return data;
  };

  const handleOnsubmit1Click = () => {
    onsubmit1();
  };

  const { mutate: onsubmit1 } = useMutation(useProfile1, {
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      deleteCookie("profileimage");
      deleteCookie("location");
      deleteCookie("category");
      setCookie("location", CHGlocation);
      setCookie("category", CHGcategory);
      setCookie("profileimage", data?.data.profileImage);
      Swal.fire({
        text: "변경이 완료되었습니다.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "확인",
      });
      close();
    },
    onError: () => {
      Swal.fire({
        text: "error",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "확인",
      });
      return;
    },
  });

  // if (MyProfileModal.isLoading) {
  //   return null;
  // }

  //input창 숨기고 사진 넣기
  const onClickImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <StModal className={open ? "openModal" : ""}>
        {open ? (
          <StModalSection>
            <StModalHeader>
              <h2>마이페이지 수정</h2>
              <p>Modify Mypage</p>
            </StModalHeader>

            <StModalMain>
              <StProfileImg
                src={
                  previewImg.split("/")[3] === "null"
                    ? "https://www.snsboom.co.kr/common/img/default_profile.png"
                    : previewImg
                }
                alt="profile"
                onClick={onClickImageUpload}
              />
              <input
                type="file"
                id="file"
                accept={"image/*"}
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    encodeFileToBase64(file);
                    const fileURL = URL.createObjectURL(file);
                    setCHGprofileImg(fileURL);
                  }
                }}
              />
              <StChgProfile>
                <img src={chgImg} alt="img" onClick={onClickImageUpload} />
              </StChgProfile>
              <StModifyBox>
                <StWrap>
                  <p>닉네임</p>
                  <StInputWrap>
                    <input
                      defaultValue={nickname}
                      onChange={(e) => {
                        setCHGnickname(e.target.value);
                      }}
                    />
                    <StDupButton onClick={handleDupnickClick}>
                      중복 확인
                    </StDupButton>
                  </StInputWrap>
                </StWrap>
                <StPointWrap>
                  <p>지역</p>
                  <Location
                    width="317px"
                    height="61px"
                    fontSize="18px"
                    background-color="#333"
                    value={location}
                    onChange={(selectedValue) => setCHGlocation(selectedValue)}
                  />
                </StPointWrap>
                <StPointWrap>
                  <p>카테고리</p>
                  <Category
                    width="317px"
                    height="61px"
                    fontSize="18px"
                    background-color="#333"
                    value={category}
                    onChange={(selectedValue) => setCHGcategory(selectedValue)}
                  />
                </StPointWrap>
                <StWrap2>
                  <p>자기소개</p>
                  <StIntroTextBox
                    defaultValue={introduction}
                    onChange={(e) => {
                      setCHGIntroduction(e.target.value);
                    }}
                  />
                </StWrap2>
              </StModifyBox>
            </StModalMain>
            <StModalFooter>
              <StModalButton onClick={close}>취소하기</StModalButton>
              {PreNickname === CHGnickname ? (
                <StModalButton onClick={handleOnsubmit1Click}>
                  수정
                </StModalButton>
              ) : (
                <StModalButton onClick={handleOnsubmitClick}>
                  수정
                </StModalButton>
              )}
            </StModalFooter>
          </StModalSection>
        ) : null}
      </StModal>
    </>
  );
};

const modalShow = keyframes`
  from {
    opacity: 0;
    margin-top: -50px;
  }

  to {
    opacity: 1;
    margin-top: 0;
  }
`;

const modalBgShow = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const StModal = styled.div`
  display: flex;
  align-items: center;
  animation: ${modalBgShow} 0.5s;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.6);
`;

const StModalSection = styled.section`
  width: 90%;
  max-width: 606px;
  margin: 0 auto;
  border-radius: 5px;
  background-color: #f9b937;
  animation: ${modalShow} 0.3s;
  overflow: hidden;
`;

const StModalHeader = styled.div`
  display: flex;
  text-align: center;
  flex-direction: column;
  width: 100%;
  border-bottom: solid 1px #acacac;
  margin: 0 auto 32px auto;
  padding-bottom: 25px;
  > h2 {
    font-size: 30px;
    font-weight: 400;
    line-height: 45px;
  }
  > p {
    font-size: 20px;
    font-weight: 300;
    line-height: 30px;
  }
`;

const StModalMain = styled.div`
  width: 386px;
  height: 500px;
  margin: 160px auto;
`;

const StModalFooter = styled.div`
  padding: 12px;
  display: flex;
  justify-content: center;
  gap: 16px;
`;

const StModalButton = styled.button`
  width: 184px;
  height: 50px;
  background-color: black;
  display: flex;
  justify-content: center;
  text-align: center;
  color: white;
  font-size: 16px;
  font-weight: 400;
  line-height: 50px;
  letter-spacing: 0em;
  margin-top: 41px;
`;

const StProfileImg = styled.img`
  width: 154px;
  height: 154px;
  border-radius: 154px;
  display: block;
  margin: 0px auto;
  background-color: white;
  border: 1px solid black;
`;

const StChgProfile = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 30px;
  border: 1px solid gray;
  justify-content: center;
  display: flex;
  align-items: center;
  position: relative;
  right: -56%;
  bottom: 30px;
  background-color: white;
`;

const StModifyBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
`;

const StWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StInputWrap = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: white;
  border-bottom: solid 1px #acacac;
  width: 272px;
  height: 50px;
`;

const StDupButton = styled.button`
  width: 96px;
  height: 34px;
  color: black;
  border: 1px solid gray;
  margin: 8px 8px 8px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 80px;
`;

const StPointWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 20.3px;
`;

const StWrap2 = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  gap: 8px;
`;

const StIntroTextBox = styled.textarea`
  width: 400px;
  height: 192px;
  resize: none;
  border: none;
  border-bottom: solid 1px #acacac;
  padding: 10px;
  :focus {
    outline: none;
  }
`;

export default MyProfileModal;
