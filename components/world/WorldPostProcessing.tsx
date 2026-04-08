"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export function WorldPostProcessing({
  mobileView = false,
  reducedDetail = false
}: {
  mobileView?: boolean;
  reducedDetail?: boolean;
}) {
  const composerRef = useRef<EffectComposer | null>(null);
  const { camera, gl, scene, size } = useThree();

  useEffect(() => {
    if (!reducedDetail) {
      return undefined;
    }

    composerRef.current?.dispose();
    composerRef.current = null;

    return undefined;
  }, [reducedDetail]);

  const passes = useMemo(() => {
    if (reducedDetail) {
      return null;
    }

    const renderPass = new RenderPass(scene, camera);
    const ssaoPass = mobileView ? null : new SSAOPass(scene, camera, size.width, size.height);

    if (ssaoPass) {
      ssaoPass.kernelRadius = 16;
      ssaoPass.minDistance = 0.003;
      ssaoPass.maxDistance = 0.14;
    }

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      mobileView ? 0.08 : 0.28,
      mobileView ? 0.14 : 0.44,
      mobileView ? 0.96 : 0.8
    );

    return { bloomPass, renderPass, ssaoPass };
  }, [camera, mobileView, reducedDetail, scene, size.height, size.width]);

  useEffect(() => {
    if (!passes) {
      return undefined;
    }

    const composer = new EffectComposer(gl);
    composer.addPass(passes.renderPass);
    if (passes.ssaoPass) {
      composer.addPass(passes.ssaoPass);
    }
    composer.addPass(passes.bloomPass);
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, mobileView ? 1.7 : 1.35));
    composerRef.current = composer;

    return () => {
      composer.dispose();
      passes.bloomPass.dispose();
      passes.ssaoPass?.dispose();
      composerRef.current = null;
    };
  }, [gl, mobileView, passes, size.height, size.width]);

  useEffect(() => {
    if (!composerRef.current || reducedDetail) {
      return;
    }

    composerRef.current?.setSize(size.width, size.height);
    composerRef.current?.setPixelRatio(Math.min(window.devicePixelRatio, mobileView ? 1.7 : 1.35));
  }, [mobileView, reducedDetail, size.height, size.width]);

  useFrame(() => {
    if (!reducedDetail) {
      composerRef.current?.render();
    }
  }, 1);

  return null;
}
